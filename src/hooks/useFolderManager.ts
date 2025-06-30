import { useEffect } from '../lib/teact/teact';

import {
  addOrderedIdsCallback,
  addUnreadCountersCallback,
  getOrderedIds,
  getUnreadCounters,
} from '../util/folderManager';
import useForceUpdate from './useForceUpdate';

export function useFolderManagerForOrderedIds(folderId: number) {
  const forceUpdate = useForceUpdate();

  useEffect(() => addOrderedIdsCallback(folderId, forceUpdate), [folderId, forceUpdate]);

  return getOrderedIds(folderId);
}

export function useFolderManagerForUnreadCounters() {
  const forceUpdate = useForceUpdate();

  useEffect(() => addUnreadCountersCallback(forceUpdate), [forceUpdate]);

  return getUnreadCounters();
}
