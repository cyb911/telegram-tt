declare const globalThis: ServiceWorkerGlobalScope & WorkerGlobalScope & SharedWorkerGlobalScope & Window;

export const IS_MULTIACCOUNT_SUPPORTED = 'SharedWorker' in globalThis;
export const IS_INTL_LIST_FORMAT_SUPPORTED = 'ListFormat' in Intl;
export const IS_BAD_URL_PARSER = new URL('tg://host').host !== 'host';
