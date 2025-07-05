import type { FastTextApi } from '../lib/fasttextweb/fasttext.worker';
import type { Connector } from './PostMessageConnector';

import { IS_TRANSLATION_SUPPORTED } from './browser/windowEnvironment';

import Deferred from './Deferred';
import { createConnector } from './PostMessageConnector';

const WORKER_INIT_DELAY = 4000;

let worker: Connector<FastTextApi> | undefined;
const initializationDeferred = new Deferred();

if (IS_TRANSLATION_SUPPORTED) {
  setTimeout(initWorker, WORKER_INIT_DELAY);
}

function initWorker() {
  if (!worker) {
    worker = createConnector<FastTextApi>(
      new Worker(new URL('../lib/fasttextweb/fasttext.worker.ts', import.meta.url)),
    );
    initializationDeferred.resolve();
  }
}
