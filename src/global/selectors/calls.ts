import type { GlobalState } from '../types';

import { selectUser } from './users';

export function selectGroupCall<T extends GlobalState>(global: T, groupCallId: string) {
  return global.groupCalls.byId[groupCallId];
}

export function selectGroupCallParticipant<T extends GlobalState>(
  global: T, groupCallId: string, participantId: string,
) {
  return selectGroupCall(global, groupCallId)?.participants[participantId];
}

export function selectActiveGroupCall<T extends GlobalState>(global: T) {
  const { groupCalls: { activeGroupCallId } } = global;
  if (!activeGroupCallId) {
    return undefined;
  }

  return selectGroupCall(global, activeGroupCallId);
}

export function selectPhoneCallUser<T extends GlobalState>(global: T) {
  const { phoneCall, currentUserId } = global;
  if (!phoneCall || !phoneCall.participantId || !phoneCall.adminId) {
    return undefined;
  }

  const id = phoneCall.adminId === currentUserId ? phoneCall.participantId : phoneCall.adminId;
  return selectUser(global, id);
}
