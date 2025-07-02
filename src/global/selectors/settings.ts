import type { GlobalState } from '../types';

import { selectSharedSettings } from './sharedState';

export function selectNotifyDefaults<T extends GlobalState>(global: T) {
  return global.settings.notifyDefaults;
}

export function selectNotifyException<T extends GlobalState>(global: T, chatId: string) {
  return global.chats.notifyExceptionById?.[chatId];
}

export function selectLanguageCode<T extends GlobalState>(global: T) {
  return selectSharedSettings(global).language.replace('-raw', '');
}

export function selectTranslationLanguage<T extends GlobalState>(global: T) {
  return global.settings.byKey.translationLanguage || selectLanguageCode(global);
}

export function selectSettingsKeys<T extends GlobalState>(global: T) {
  return global.settings.byKey;
}
