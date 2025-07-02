import type {
  ApiLimitType, ApiLimitTypeForPromo, ApiPremiumSection, ApiReactionEmoji,
} from './api/types';
import type {
  GiftProfileFilterOptions,
  ResaleGiftsFilterOptions,
} from './types';

export const APP_CODE_NAME = 'A';
export const APP_NAME = process.env.APP_NAME || `Telegram Web ${APP_CODE_NAME}`;
export const RELEASE_DATETIME = process.env.RELEASE_DATETIME;

export const PRODUCTION_HOSTNAME = 'web.telegram.org';
export const PRODUCTION_URL = 'https://web.telegram.org/a';
export const WEB_VERSION_BASE = 'https://web.telegram.org/'; // Used to redirect to other versions
export const BASE_URL = process.env.BASE_URL;
export const ACCOUNT_QUERY = 'account';

export const IS_MOCKED_CLIENT = process.env.APP_MOCKED_CLIENT === '1';
export const IS_TEST = process.env.APP_ENV === 'test';
export const IS_PACKAGED_ELECTRON = process.env.IS_PACKAGED_ELECTRON;
export const USE_STATIC_PREMIUM_PROMO = process.env.USE_STATIC_PREMIUM_PROMO === '1';

export const ELECTRON_WINDOW_DRAG_EVENT_START = 'tt-electron-window-drag-start';
export const ELECTRON_WINDOW_DRAG_EVENT_END = 'tt-electron-window-drag-end';

export const DEBUG = process.env.APP_ENV !== 'production';
export const DEBUG_MORE = false;
export const STRICTERDOM_ENABLED = DEBUG;
export const BOT_VERIFICATION_PEERS_LIMIT = 20;

export const ELECTRON_HOST_URL = process.env.ELECTRON_HOST_URL!;

export const DEBUG_ALERT_MSG = 'Shoot!\nSomething went wrong, please see the error details in Dev Tools Console.';
export const DEBUG_GRAMJS = false;

export const PAGE_TITLE = process.env.APP_TITLE!;
export const INACTIVE_MARKER = '[Inactive]';

export const SESSION_LEGACY_USER_KEY = 'user_auth';
export const SESSION_ACCOUNT_PREFIX = 'account';
export const LEGACY_PASSCODE_CACHE_NAME = 'tt-passcode';

export const MULTIACCOUNT_MAX_SLOTS = 6;
export const GLOBAL_STATE_CACHE_DISABLED = false;
export const GLOBAL_STATE_CACHE_PREFIX = 'tt-global-state';
export const SHARED_STATE_CACHE_KEY = 'tt-shared-state';
export const GLOBAL_STATE_CACHE_USER_LIST_LIMIT = 500;
export const GLOBAL_STATE_CACHE_CHAT_LIST_LIMIT = 200;
export const GLOBAL_STATE_CACHE_ARCHIVED_CHAT_LIST_LIMIT = 10;
export const GLOBAL_STATE_CACHE_CUSTOM_EMOJI_LIMIT = 150;

export const IS_SCREEN_LOCKED_CACHE_KEY = 'tt-is-screen-locked';

export const MEDIA_CACHE_DISABLED = false;
export const MEDIA_CACHE_NAME = 'tt-media';
export const MEDIA_CACHE_NAME_AVATARS = 'tt-media-avatars';
export const MEDIA_PROGRESSIVE_CACHE_DISABLED = false;
export const MEDIA_PROGRESSIVE_CACHE_NAME = 'tt-media-progressive';
export const MEDIA_CACHE_MAX_BYTES = 512 * 1024; // 512 KB
export const CUSTOM_BG_CACHE_NAME = 'tt-custom-bg';
export const LANG_CACHE_NAME = 'tt-lang-packs-v49';
export const ASSET_CACHE_NAME = 'tt-assets';
export const DATA_BROADCAST_CHANNEL_PREFIX = 'tt-global';
export const ESTABLISH_BROADCAST_CHANNEL_PREFIX = 'tt-establish';
export const MULTITAB_LOCALSTORAGE_KEY_PREFIX = 'tt-multitab';
export const DC_IDS = [1, 2, 3, 4, 5] as const;

export const DOWNLOAD_WORKERS = 16;
export const UPLOAD_WORKERS = 16;

const isBigScreen = typeof window !== 'undefined' && window.innerHeight >= 900;

export const MIN_PASSWORD_LENGTH = 1;

export const MESSAGE_LIST_SLICE = isBigScreen ? 60 : 40;
export const MESSAGE_LIST_VIEWPORT_LIMIT = MESSAGE_LIST_SLICE * 2;

export const CHAT_HEIGHT_PX = 72;
export const PEER_PICKER_ITEM_HEIGHT_PX = 56;
export const CHAT_LIST_LOAD_SLICE = 100;
export const SHARED_MEDIA_SLICE = 42;
export const CHAT_MEDIA_SLICE = 42;
export const MESSAGE_SEARCH_SLICE = 42;
export const PINNED_MESSAGES_LIMIT = 50;
export const BLOCKED_LIST_LIMIT = 100;
export const STORY_LIST_LIMIT = 100;
export const API_GENERAL_ID_LIMIT = 100;
export const STATISTICS_PUBLIC_FORWARDS_LIMIT = 50;
export const RESALE_GIFTS_LIMIT = 50;

export const GLOBAL_SUGGESTED_CHANNELS_ID = 'global';

// As in Telegram for Android
// https://github.com/DrKLO/Telegram/blob/51e9947527/TMessagesProj/src/main/java/org/telegram/messenger/MediaDataController.java#L7799
export const TOP_REACTIONS_LIMIT = 100;

// As in Telegram for Android
// https://github.com/DrKLO/Telegram/blob/51e9947527/TMessagesProj/src/main/java/org/telegram/messenger/MediaDataController.java#L7781
export const RECENT_REACTIONS_LIMIT = 50;
export const REACTION_LIST_LIMIT = 100;
export const REACTION_UNREAD_SLICE = 100;
export const MENTION_UNREAD_SLICE = 100;
export const TOPICS_SLICE = 20;
export const TOPICS_SLICE_SECOND_LOAD = 500;

export const TOP_CHAT_MESSAGES_PRELOAD_LIMIT = 20;

export const SPONSORED_MESSAGE_CACHE_MS = 300000; // 5 min

export const DEFAULT_VOLUME = 1;
export const DEFAULT_PLAYBACK_RATE = 1;
export const PLAYBACK_RATE_FOR_AUDIO_MIN_DURATION = 20 * 60; // 20 min

export const ANIMATION_LEVEL_MAX = 2;
export const ANIMATION_LEVEL_DEFAULT = ANIMATION_LEVEL_MAX;

export const DEFAULT_MESSAGE_TEXT_SIZE_PX = 16;
export const IOS_DEFAULT_MESSAGE_TEXT_SIZE_PX = 17;
export const MACOS_DEFAULT_MESSAGE_TEXT_SIZE_PX = 15;

export const SEND_MESSAGE_ACTION_INTERVAL = 3000; // 3s
// 10000s from https://corefork.telegram.org/api/url-authorization#automatic-authorization
export const APP_CONFIG_REFETCH_INTERVAL = 10000 * 1000;
export const GENERAL_REFETCH_INTERVAL = 60 * 60 * 1000; // 1h

export const EDITABLE_INPUT_ID = 'editable-message-text';
export const EDITABLE_INPUT_MODAL_ID = 'editable-message-text-modal';
// eslint-disable-next-line @stylistic/max-len
export const EDITABLE_INPUT_CSS_SELECTOR = `.messages-layout .Transition_slide-active #${EDITABLE_INPUT_ID}, .messages-layout .Transition > .Transition_slide-to #${EDITABLE_INPUT_ID}`;

export const MESSAGE_CONTENT_CLASS_NAME = 'message-content';
export const VIEW_TRANSITION_CLASS_NAME = 'active-view-transition';

export const RESIZE_HANDLE_CLASS_NAME = 'resizeHandle';
export const RESIZE_HANDLE_SELECTOR = `.${RESIZE_HANDLE_CLASS_NAME}`;

export const STARS_ICON_PLACEHOLDER = '⭐';
export const STARS_CURRENCY_CODE = 'XTR';

export const MIN_SCREEN_WIDTH_FOR_STATIC_RIGHT_COLUMN = 1275; // px
export const MIN_SCREEN_WIDTH_FOR_STATIC_LEFT_COLUMN = 925; // px
export const MOBILE_SCREEN_MAX_WIDTH = 600; // px
export const MOBILE_SCREEN_LANDSCAPE_MAX_WIDTH = 950; // px
export const MOBILE_SCREEN_LANDSCAPE_MAX_HEIGHT = 450; // px

export const MAX_INT_32 = 2 ** 31 - 1;
export const TMP_CHAT_ID = '0';

export const ANIMATION_END_DELAY = 100;
export const ANIMATION_WAVE_MIN_INTERVAL = 200;

export const SCROLL_MIN_DURATION = 300;
export const SCROLL_MAX_DURATION = 600;
export const SCROLL_MAX_DISTANCE = 800;
export const SCROLL_SHORT_TRANSITION_MAX_DISTANCE = 300; // px

// Average duration of message sending animation
export const API_UPDATE_THROTTLE = Math.round((SCROLL_MIN_DURATION + SCROLL_MAX_DURATION) / 2);
export const API_THROTTLE_RESET_UPDATES = new Set([
  'newMessage',
  'newScheduledMessage',
  'deleteMessages',
  'deleteScheduledMessages',
  'deleteHistory',
  'deleteParticipantHistory',
]);

export const LOCK_SCREEN_ANIMATION_DURATION_MS = 200;

export const STICKER_SIZE_AUTH = 160;
export const STICKER_SIZE_AUTH_MOBILE = 120;
export const STICKER_SIZE_PICKER = 72;
export const EMOJI_SIZE_PICKER = 36;
export const STICKER_SIZE_PICKER_HEADER = 32;
export const STICKER_PICKER_MAX_SHARED_COVERS = 20;
export const STICKER_SIZE_MODAL = 72;
export const EMOJI_SIZE_MODAL = 36;
export const STICKER_SIZE_TWO_FA = 160;
export const RECENT_STICKERS_LIMIT = 20;
export const RECENT_STATUS_LIMIT = 20;
export const EMOJI_STATUS_LOOP_LIMIT = 2;
export const TOP_SYMBOL_SET_ID = 'top';
export const POPULAR_SYMBOL_SET_ID = 'popular';
export const RECENT_SYMBOL_SET_ID = 'recent';
export const COLLECTIBLE_STATUS_SET_ID = 'collectibleStatus';
export const FAVORITE_SYMBOL_SET_ID = 'favorite';
export const EFFECT_STICKERS_SET_ID = 'effectStickers';
export const EFFECT_EMOJIS_SET_ID = 'effectEmojis';
export const DEFAULT_TOPIC_ICON_STICKER_ID = 'topic-default-icon';
export const DEFAULT_STATUS_ICON_ID = 'status-default-icon';

export const BASE_EMOJI_KEYWORD_LANG = 'en';

export const SLIDE_TRANSITION_DURATION = 450;

export const BIRTHDAY_NUMBERS_SET = 'FestiveFontEmoji';
export const RESTRICTED_EMOJI_SET = 'RestrictedEmoji';

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
export const SVG_EXTENSIONS = new Set(['svg', 'svgz']);

export const VIDEO_WEBM_TYPE = 'video/webm';
export const GIF_MIME_TYPE = 'image/gif';

export const LOTTIE_STICKER_MIME_TYPE = 'application/x-tgsticker';
export const VIDEO_STICKER_MIME_TYPE = VIDEO_WEBM_TYPE;

export const SUPPORTED_PHOTO_CONTENT_TYPES = new Set([
  'image/png', 'image/jpeg', GIF_MIME_TYPE,
]);

export const SUPPORTED_VIDEO_CONTENT_TYPES = new Set([
  'video/mp4', 'video/quicktime',
]);

export const SUPPORTED_AUDIO_CONTENT_TYPES = new Set([
  'audio/mp3',
  'audio/ogg',
  'audio/wav',
  'audio/mpeg',
  'audio/flac',
  'audio/aac',
  'audio/m4a',
  'audio/mp4',
  'audio/x-m4a',
]);

export const CONTENT_TYPES_WITH_PREVIEW = new Set([
  ...SUPPORTED_PHOTO_CONTENT_TYPES,
  ...SUPPORTED_VIDEO_CONTENT_TYPES,
]);

export const CONTENT_NOT_SUPPORTED = 'The message is not supported on this version of Telegram.';

// Taken from https://github.com/telegramdesktop/tdesktop/blob/41d9a9fcbd0c809c60ddbd9350791b1436aff7d9/Telegram/SourceFiles/ui/boxes/choose_language_box.cpp#L28
export const SUPPORTED_TRANSLATION_LANGUAGES = [
  // Official
  'en', 'ar', 'be', 'ca', 'zh', 'nl', 'fr', 'de', 'id',
  'it', 'ja', 'ko', 'pl', 'pt', 'ru', 'es', 'uk',
  // Unofficial
  'af', 'sq', 'am', 'hy', 'az', 'eu', 'bn', 'bs', 'bg',
  'ceb', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'eo',
  'et', 'fi', 'fy', 'gl', 'ka', 'el', 'gu', 'ht', 'ha',
  'haw', 'he', 'iw', 'hi', 'hmn', 'hu', 'is', 'ig', 'ga',
  'jv', 'kn', 'kk', 'km', 'rw', 'ku', 'ky', 'lo', 'la',
  'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi',
  'mr', 'mn', 'my', 'ne', 'no', 'ny', 'or', 'ps', 'fa',
  'pa', 'ro', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si',
  'sk', 'sl', 'so', 'su', 'sw', 'sv', 'tl', 'tg', 'ta',
  'tt', 'te', 'th', 'tr', 'tk', 'ur', 'ug', 'uz', 'vi',
  'cy', 'xh', 'yi', 'yo', 'zu',
];

// eslint-disable-next-line @stylistic/max-len
export const RE_LINK_TEMPLATE = '((ftp|https?):\\/\\/)?((www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z][-a-zA-Z0-9]{1,62})\\b([-a-zA-Z0-9()@:%_+.,~#?&/=]*)';
export const RE_MENTION_TEMPLATE = '(@[\\w\\d_-]+)';
export const RE_TG_LINK = /^tg:(\/\/)?/i;
export const RE_TME_LINK = /^(https?:\/\/)?([-a-zA-Z0-9@:%_+~#=]{1,32}\.)?t\.me/i;
export const RE_TELEGRAM_LINK = /^(https?:\/\/)?telegram\.org\//i;
export const TME_LINK_PREFIX = 'https://t.me/';
export const BOT_FATHER_USERNAME = 'botfather';
export const USERNAME_PURCHASE_ERROR = 'USERNAME_PURCHASE_AVAILABLE';
export const MESSAGE_ID_REQUIRED_ERROR = 'MESSAGE_ID_REQUIRED';
export const ACCEPTABLE_USERNAME_ERRORS = new Set([USERNAME_PURCHASE_ERROR, 'USERNAME_INVALID']);
export const TME_WEB_DOMAINS = new Set(['t.me', 'web.t.me', 'a.t.me', 'k.t.me', 'z.t.me']);
export const WEB_APP_PLATFORM = 'weba';
export const LANG_PACK = 'weba';

// eslint-disable-next-line @stylistic/max-len
export const COUNTRIES_WITH_12H_TIME_FORMAT = new Set(['AU', 'BD', 'CA', 'CO', 'EG', 'HN', 'IE', 'IN', 'JO', 'MX', 'MY', 'NI', 'NZ', 'PH', 'PK', 'SA', 'SV', 'US']);

export const API_CHAT_TYPES = ['bots', 'channels', 'chats', 'users', 'groups'] as const;

export const HEART_REACTION: ApiReactionEmoji = {
  type: 'emoji',
  emoticon: '❤',
};

// MTProto constants
export const SERVICE_NOTIFICATIONS_USER_ID = '777000';
export const REPLIES_USER_ID = '1271266957'; // TODO For Test connection ID must be equal to 708513
export const VERIFICATION_CODES_USER_ID = '489000';
export const ANONYMOUS_USER_ID = '2666000';
export const RESTRICTED_EMOJI_SET_ID = '7173162320003080';
export const CHANNEL_ID_BASE = 10 ** 12;
export const DEFAULT_GIF_SEARCH_BOT_USERNAME = 'gif';
export const ALL_FOLDER_ID = 0;
export const ARCHIVED_FOLDER_ID = 1;
export const SAVED_FOLDER_ID = -1;
export const DELETED_COMMENTS_CHANNEL_ID = '-1000000000777';
export const MAX_MEDIA_FILES_FOR_ALBUM = 10;
export const MAX_ACTIVE_PINNED_CHATS = 5;
export const SCHEDULED_WHEN_ONLINE = 0x7FFFFFFE;
export const LANG_PACKS = ['android', 'ios', 'tdesktop', 'macos'] as const;
export const GENERAL_TOPIC_ID = 1;
export const STORY_EXPIRE_PERIOD = 86400; // 1 day
export const STORY_VIEWERS_EXPIRE_PERIOD = 86400; // 1 day
export const GIVEAWAY_BOOST_PER_PREMIUM = 4;
export const GIVEAWAY_MAX_ADDITIONAL_CHANNELS = 10;
export const GIVEAWAY_MAX_ADDITIONAL_USERS = 10;
export const GIVEAWAY_MAX_ADDITIONAL_COUNTRIES = 10;

export const DEFAULT_PATTERN_COLOR = '#4A8E3A8C';
export const DARK_THEME_PATTERN_COLOR = '#0A0A0A8C';
export const PEER_COLOR_BG_OPACITY = '1a';
export const PEER_COLOR_BG_ACTIVE_OPACITY = '2b';
export const PEER_COLOR_GRADIENT_STEP = 5; // px
export const MAX_UPLOAD_FILEPART_SIZE = 524288;
export const MAX_UNIQUE_REACTIONS = 11;

export const IGNORE_UNHANDLED_ERRORS = new Set([
  'USER_CANCELED',
]);

export const DEFAULT_LIMITS: Record<ApiLimitType, readonly [number, number]> = {
  uploadMaxFileparts: [4000, 8000],
  stickersFaved: [5, 10],
  savedGifs: [200, 400],
  dialogFiltersChats: [100, 200],
  dialogFilters: [10, 20],
  dialogFolderPinned: [5, 10],
  captionLength: [1024, 4096],
  channels: [500, 1000],
  channelsPublic: [10, 20],
  aboutLength: [70, 140],
  chatlistInvites: [3, 100],
  chatlistJoined: [2, 20],
  recommendedChannels: [10, 100],
  savedDialogsPinned: [5, 100],
  moreAccounts: [3, MULTIACCOUNT_MAX_SLOTS],
};
export const DEFAULT_MAX_MESSAGE_LENGTH = 4096;

export const ONE_TIME_MEDIA_TTL_SECONDS = 2147483647;

// Premium
export const PREMIUM_FEATURE_SECTIONS = [
  'stories',
  'double_limits',
  'more_upload',
  'faster_download',
  'voice_to_text',
  'no_ads',
  'infinite_reactions',
  'premium_stickers',
  'animated_emoji',
  'advanced_chat_management',
  'profile_badge',
  'animated_userpics',
  'emoji_status',
  'translations',
  'saved_tags',
  'last_seen',
  'message_privacy',
  'effects',
] as const;

export const PREMIUM_BOTTOM_VIDEOS: ApiPremiumSection[] = [
  'faster_download',
  'voice_to_text',
  'advanced_chat_management',
  'infinite_reactions',
  'profile_badge',
  'animated_userpics',
  'emoji_status',
  'translations',
  'saved_tags',
  'last_seen',
  'message_privacy',
  'effects',
];

export const PREMIUM_LIMITS_ORDER: ApiLimitTypeForPromo[] = [
  'channels',
  'dialogFolderPinned',
  'channelsPublic',
  'savedGifs',
  'stickersFaved',
  'aboutLength',
  'captionLength',
  'dialogFilters',
  'dialogFiltersChats',
  'moreAccounts',
  'recommendedChannels',
];

export const DEFAULT_GIFT_PROFILE_FILTER_OPTIONS: GiftProfileFilterOptions = {
  sortType: 'byDate',
  shouldIncludeUnlimited: true,
  shouldIncludeLimited: true,
  shouldIncludeUnique: true,
  shouldIncludeDisplayed: true,
  shouldIncludeHidden: true,
} as const;

export const DEFAULT_RESALE_GIFTS_FILTER_OPTIONS: ResaleGiftsFilterOptions = {
  sortType: 'byDate',
};
