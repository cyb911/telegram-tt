import { DEBUG } from '../config';
import { createCallbackManager } from './callbacks';

export enum Bundles {
  Main,
  Extra,
  Calls,
}

interface ImportedBundles {
  [Bundles.Main]: typeof import('../bundles/main');
  [Bundles.Extra]: typeof import('../bundles/extra');
}

type BundlePromises = {
  [K in keyof ImportedBundles]: Promise<ImportedBundles[K]>
};

export type BundleModules<B extends keyof ImportedBundles> = keyof ImportedBundles[B];

const LOAD_PROMISES: Partial<BundlePromises> = {};
const MEMORY_CACHE: Partial<ImportedBundles> = {};

const { addCallback, runCallbacks } = createCallbackManager();

export async function loadBundle<B extends Bundles>(bundleName: B) {
  if (!LOAD_PROMISES[bundleName]) {
    switch (bundleName) {
      case Bundles.Main:
        if (DEBUG) {
          // eslint-disable-next-line no-console
          console.log('>>> START LOAD MAIN BUNDLE');
        }

        LOAD_PROMISES[Bundles.Main] = import(/* webpackChunkName: "BundleMain" */ '../bundles/main');
        break;
      case Bundles.Extra:
        LOAD_PROMISES[Bundles.Extra] = import(/* webpackChunkName: "BundleExtra" */ '../bundles/extra');
        break;
    }

    (LOAD_PROMISES[bundleName]!).then(runCallbacks);
  }

  const bundle = (await LOAD_PROMISES[bundleName]) as unknown as ImportedBundles[B];

  if (!MEMORY_CACHE[bundleName]) {
    MEMORY_CACHE[bundleName] = bundle;
  }

  return bundle;
}

export async function loadModule<B extends Bundles>(bundleName: B) {
  await loadBundle(bundleName);
}

export function getModuleFromMemory<B extends Bundles, M extends BundleModules<B>>(
  bundleName: B, moduleName: M,
): ImportedBundles[B][M] | undefined {
  const bundle = MEMORY_CACHE[bundleName] as ImportedBundles[B];

  if (!bundle) {
    return undefined;
  }

  return bundle[moduleName];
}

export const addLoadListener = addCallback;
