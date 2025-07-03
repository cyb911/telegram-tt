import type { OldLangFn } from '../../hooks/useOldLang';
import type { TimeFormat } from '../../types';
import type { LangFn } from '../localization';

import withCache from '../withCache';

const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

export function getDayStart(datetime: number | Date) {
  const date = new Date(datetime);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getDayStartAt(datetime: number | Date) {
  return getDayStart(datetime).getTime();
}

function toIsoString(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

// @optimization `toLocaleTimeString` is avoided because of bad performance
export function formatTime(lang: OldLangFn, datetime: number | Date) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const timeFormat = lang.timeFormat || '24h';

  let hours = date.getHours();
  let marker = '';
  if (timeFormat === '12h') {
    marker = hours >= 12 ? '\xa0PM' : '\xa0AM'; // NBSP
    hours = hours > 12 ? hours % 12 : hours;
  }

  return `${String(hours).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}${marker}`;
}

export function formatPastTimeShort(lang: OldLangFn, datetime: number | Date, alwaysShowTime = false) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const time = formatTime(lang, date);

  const today = getDayStart(new Date());
  if (date >= today) {
    return time;
  }

  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  if (date >= weekAgo) {
    const weekday = lang(`Weekday.Short${WEEKDAYS_FULL[date.getDay()]}`);
    return alwaysShowTime ? lang('FullDateTimeFormat', [weekday, time]) : weekday;
  }

  const noYear = date.getFullYear() === today.getFullYear();

  const formattedDate = formatDateToString(date, lang.code, noYear);
  return alwaysShowTime ? lang('FullDateTimeFormat', [formattedDate, time]) : formattedDate;
}

export function formatFullDate(lang: OldLangFn | LangFn, datetime: number | Date) {
  return formatDateToString(datetime, lang.code, false, 'numeric');
}

export function formatCountdownShort(lang: OldLangFn, msLeft: number): string {
  if (msLeft < 60 * 1000) {
    return Math.ceil(msLeft / 1000).toString();
  } else if (msLeft < 60 * 60 * 1000) {
    return Math.ceil(msLeft / (60 * 1000)).toString();
  } else if (msLeft < MILLISECONDS_IN_DAY) {
    return lang('MessageTimer.ShortHours', Math.ceil(msLeft / (60 * 60 * 1000)));
  } else {
    return lang('MessageTimer.ShortDays', Math.ceil(msLeft / MILLISECONDS_IN_DAY));
  }
}

export function formatHumanDate(
  lang: OldLangFn,
  datetime: number | Date,
  isShort = false,
  noWeekdays = false,
  isUpperFirst?: boolean,
) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = getDayStart(new Date());

  if (!noWeekdays) {
    if (toIsoString(date) === toIsoString(today)) {
      return (isUpperFirst || !isShort ? upperFirst : lowerFirst)(lang('Weekday.Today'));
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (toIsoString(date) === toIsoString(yesterday)) {
      return (isUpperFirst || !isShort ? upperFirst : lowerFirst)(lang('Weekday.Yesterday'));
    }

    const limitBefore = new Date(today);
    limitBefore.setDate(today.getDate() - 6); // Avoid returning same weekday as today
    const limitAhead = new Date(today);
    limitAhead.setDate(today.getDate() + 6);

    if (date >= limitBefore && date <= limitAhead) {
      const weekDayString = formatWeekday(lang, date.getDay(), isShort);
      return (isUpperFirst || !isShort ? upperFirst : lowerFirst)(weekDayString);
    }
  }

  const noYear = date.getFullYear() === today.getFullYear();
  const formattedDate = formatDateToString(date, lang.code, noYear, isShort ? 'short' : 'long');

  return (isUpperFirst || !isShort ? upperFirst : lowerFirst)(formattedDate);
}

/**
 * Returns weekday name
 * @param day 0 - Sunday, 1 - Monday, ...
 */
export function formatWeekday(lang: OldLangFn, day: number, isShort = false) {
  const weekDay = WEEKDAYS_FULL[day];
  return isShort ? lang(`Weekday.Short${weekDay}`) : lang(`Weekday.${weekDay}`);
}

export function formatMediaDateTime(
  lang: OldLangFn,
  datetime: number | Date,
  isUpperFirst?: boolean,
) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  return `${formatHumanDate(lang, date, true, undefined, isUpperFirst)}, ${formatTime(lang, date)}`;
}

export function formatMediaDuration(duration: number, maxValue?: number) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 3600 % 60);

  const maxHours = maxValue ? Math.floor(maxValue / 3600) : 0;
  const maxMinutes = maxValue ? Math.floor((maxValue % 3600) / 60) : 0;
  let string = '';
  if (hours > 0 || maxHours > 0) {
    string += `${String(hours).padStart(2, '0')}:`;
    string += `${String(minutes).padStart(2, '0')}:`;
  } else if (maxMinutes >= 10) {
    string += `${String(minutes).padStart(2, '0')}:`;
  } else {
    string += `${String(minutes)}:`;
  }
  string += String(seconds).padStart(2, '0');

  return string;
}

export function formatVoiceRecordDuration(durationInMs: number) {
  const parts = [];

  let milliseconds = durationInMs % 1000;
  durationInMs -= milliseconds;
  milliseconds = Math.floor(milliseconds / 10);

  durationInMs = Math.floor(durationInMs / 1000);
  const seconds = durationInMs % 60;
  durationInMs -= seconds;

  durationInMs = Math.floor(durationInMs / 60);
  const minutes = durationInMs % 60;
  durationInMs -= minutes;

  durationInMs = Math.floor(durationInMs / 60);
  const hours = durationInMs % 60;

  if (hours > 0) {
    parts.push(String(hours).padStart(2, '0'));
  }
  parts.push(String(minutes).padStart(hours > 0 ? 2 : 1, '0'));
  parts.push(String(seconds).padStart(2, '0'));

  return `${parts.join(':')},${String(milliseconds).padStart(2, '0')}`;
}

const formatDayToStringWithCache = withCache((
  dayStartAt: number,
  locale: string,
  noYear?: boolean,
  monthFormat: 'short' | 'long' | 'numeric' = 'short',
  noDay?: boolean,
) => {
  return new Date(dayStartAt).toLocaleString(
    locale,
    {
      year: noYear ? undefined : 'numeric',
      month: monthFormat,
      day: noDay ? undefined : 'numeric',
    },
  );
});

export function formatDateToString(
  datetime: Date | number,
  locale = 'en-US',
  noYear = false,
  monthFormat: 'short' | 'long' | 'numeric' = 'short',
  noDay = false,
) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  const dayStartAt = getDayStartAt(date);

  return formatDayToStringWithCache(dayStartAt, locale, noYear, monthFormat, noDay);
}

export function formatDateTimeToString(
  datetime: Date | number, locale = 'en-US', noSeconds?: boolean,
  timeFormat?: TimeFormat,
) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;
  return date.toLocaleString(
    locale,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: noSeconds ? undefined : 'numeric',
      hourCycle: timeFormat === '12h' ? 'h12' : 'h23',
    },
  );
}

export function formatDateAtTime(
  lang: OldLangFn,
  datetime: number | Date,
) {
  const date = typeof datetime === 'number' ? new Date(datetime) : datetime;

  const today = getDayStart(new Date());
  const time = formatTime(lang, date);

  if (toIsoString(date) === toIsoString(today)) {
    return lang('Time.TodayAt', time);
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (toIsoString(date) === toIsoString(yesterday)) {
    return lang('Time.YesterdayAt', time);
  }

  const noYear = date.getFullYear() === today.getFullYear();
  const formattedDate = formatDateToString(date, lang.code, noYear);

  return lang('formatDateAtTime', [formattedDate, time]);
}

export function formatShortDuration(lang: LangFn, duration: number) {
  if (duration < 0) {
    return lang('RightNow');
  }

  if (duration < 60) {
    const count = Math.ceil(duration);
    return lang('Seconds', { count }, { pluralValue: duration });
  }

  if (duration < 60 * 60) {
    const count = Math.ceil(duration / 60);
    return lang('Minutes', { count }, { pluralValue: count });
  }

  if (duration < 60 * 60 * 24) {
    const count = Math.ceil(duration / (60 * 60));
    return lang('Hours', { count }, { pluralValue: count });
  }

  const count = Math.ceil(duration / (60 * 60 * 24));
  return lang('Days', { count }, { pluralValue: count });
}

function lowerFirst(str: string) {
  return `${str[0].toLowerCase()}${str.slice(1)}`;
}

function upperFirst(str: string) {
  return `${str[0].toUpperCase()}${str.slice(1)}`;
}
