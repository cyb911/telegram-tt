import {
  clear,
  createStore,
  del,
  entries as getEntries,
  get,
  keys as getKeys,
  set,
  update,
  values as getValues,
} from 'idb-keyval';

class IdbStore {
  public store: ReturnType<typeof createStore>;

  constructor(name: string) {
    this.store = createStore(name, 'store');
  }

  public set(key: string, value: any) {
    return set(key, value, this.store);
  }

  public get<T = unknown>(key: string) {
    return get<T>(key, this.store);
  }

  public clear() {
    return clear(this.store);
  }

  public del(key: string) {
    return del(key, this.store);
  }

  public entries() {
    return getEntries(this.store);
  }

  public keys() {
    return getKeys(this.store);
  }

  public values<T = unknown>() {
    return getValues<T>(this.store);
  }

  public update<T = unknown>(key: string, updater: (oldValue: T | undefined) => T) {
    return update(key, updater, this.store);
  }
}

export const MAIN_IDB_STORE = new IdbStore('tt-data');
export const PASSCODE_IDB_STORE = new IdbStore('tt-passcode');
