import BigInt from 'big-integer';
import { Api as GramJs } from '../../../lib/gramjs';

import type { JoinGroupCallPayload } from '../../../lib/secret-sauce';
import type {
  ApiGroupCall, ApiPhoneCall, ApiUser,
} from '../../types';

import {
  buildApiGroupCall,
  buildCallProtocol,
  buildPhoneCall,
} from '../apiBuilders/calls';
import {
  buildInputGroupCall, buildInputPeer, buildInputPhoneCall, buildInputUser, generateRandomInt,
} from '../gramjsBuilders';
import { sendApiUpdate } from '../updates/apiUpdateEmitter';
import { invokeRequest, invokeRequestBeacon } from './client';

export function discardGroupCall({
  call,
}: {
  call: ApiGroupCall;
}) {
  return invokeRequest(new GramJs.phone.DiscardGroupCall({
    call: buildInputGroupCall(call),
  }), {
    shouldReturnTrue: true,
  });
}

export function editGroupCallParticipant({
  call, participant, muted, presentationPaused, videoStopped, videoPaused, volume,
  raiseHand,
}: {
  call: ApiGroupCall; participant: ApiUser; muted?: boolean; presentationPaused?: boolean;
  videoStopped?: boolean; videoPaused?: boolean; raiseHand?: boolean; volume?: number;
}) {
  return invokeRequest(new GramJs.phone.EditGroupCallParticipant({
    call: buildInputGroupCall(call),
    participant: buildInputPeer(participant.id, participant.accessHash),
    ...(videoStopped !== undefined && { videoStopped }),
    ...(videoPaused !== undefined && { videoPaused }),
    ...(muted !== undefined && { muted }),
    ...(presentationPaused !== undefined && { presentationPaused }),
    ...(raiseHand !== undefined && { raiseHand }),
    ...(volume !== undefined && { volume }),
  }), {
    shouldReturnTrue: true,
  });
}

export function leaveGroupCall({
  call, isPageUnload,
}: {
  call: ApiGroupCall; isPageUnload?: boolean;
}) {
  const request = new GramJs.phone.LeaveGroupCall({
    call: buildInputGroupCall(call),
  });

  if (isPageUnload) {
    invokeRequestBeacon(request);
    return;
  }

  invokeRequest(request, {
    shouldReturnTrue: true,
  });
}

export async function joinGroupCall({
  call, inviteHash, params,
}: {
  call: ApiGroupCall; inviteHash?: string; params: JoinGroupCallPayload;
}) {
  const result = await invokeRequest(new GramJs.phone.JoinGroupCall({
    call: buildInputGroupCall(call),
    joinAs: new GramJs.InputPeerSelf(),
    muted: true,
    videoStopped: true,
    params: new GramJs.DataJSON({
      data: JSON.stringify(params),
    }),
    inviteHash,
  }), {
    shouldRetryOnTimeout: true,
    abortControllerGroup: 'call',
  });

  if (!result) return undefined;

  if (result instanceof GramJs.Updates) {
    const update = result.updates.find((u) => u instanceof GramJs.UpdateGroupCall);
    if (!(update instanceof GramJs.UpdateGroupCall)) return undefined;

    return buildApiGroupCall(update.call);
  }

  return undefined;
}

export function joinGroupCallPresentation({
  call, params,
}: {
  call: ApiGroupCall; params: JoinGroupCallPayload;
}) {
  return invokeRequest(new GramJs.phone.JoinGroupCallPresentation({
    call: buildInputGroupCall(call),
    params: new GramJs.DataJSON({
      data: JSON.stringify(params),
    }),
  }), {
    shouldReturnTrue: true,
  });
}

export function leaveGroupCallPresentation({
  call,
}: {
  call: ApiGroupCall;
}) {
  return invokeRequest(new GramJs.phone.LeaveGroupCallPresentation({
    call: buildInputGroupCall(call),
  }), {
    shouldReturnTrue: true,
  });
}

export async function getDhConfig() {
  const dhConfig = await invokeRequest(new GramJs.messages.GetDhConfig({}));

  if (!dhConfig || dhConfig instanceof GramJs.messages.DhConfigNotModified) return undefined;

  return {
    g: dhConfig.g,
    p: Array.from(dhConfig.p),
    random: Array.from(dhConfig.random),
  };
}

export function discardCall({
  call, isBusy, isPageUnload,
}: {
  call: ApiPhoneCall; isBusy?: boolean; isPageUnload?: boolean;
}) {
  const request = new GramJs.phone.DiscardCall({
    peer: buildInputPhoneCall(call),
    reason: isBusy ? new GramJs.PhoneCallDiscardReasonBusy() : new GramJs.PhoneCallDiscardReasonHangup(),
  });

  if (isPageUnload) {
    invokeRequestBeacon(request);
    return;
  }

  invokeRequest(request, {
    shouldReturnTrue: true,
  });
}

export async function requestCall({
  user, gAHash, isVideo,
}: {
  user: ApiUser; gAHash: number[]; isVideo?: boolean;
}) {
  const result = await invokeRequest(new GramJs.phone.RequestCall({
    randomId: generateRandomInt(),
    userId: buildInputUser(user.id, user.accessHash),
    gAHash: Buffer.from(gAHash),
    ...(isVideo && { video: true }),
    protocol: buildCallProtocol(),
  }));

  if (!result) {
    return undefined;
  }

  const call = buildPhoneCall(result.phoneCall);

  sendApiUpdate({
    '@type': 'updatePhoneCall',
    call,
  });

  return true;
}

export function setCallRating({
  call, rating, comment,
}: {
  call: ApiPhoneCall; rating: number; comment: string;
}) {
  return invokeRequest(new GramJs.phone.SetCallRating({
    rating,
    peer: buildInputPhoneCall(call),
    comment,
  }), {
    shouldReturnTrue: true,
  });
}

export function receivedCall({
  call,
}: {
  call: ApiPhoneCall;
}) {
  return invokeRequest(new GramJs.phone.ReceivedCall({
    peer: buildInputPhoneCall(call),
  }));
}

export async function acceptCall({
  call, gB,
}: {
  call: ApiPhoneCall; gB: number[];
}) {
  const result = await invokeRequest(new GramJs.phone.AcceptCall({
    peer: buildInputPhoneCall(call),
    gB: Buffer.from(gB),
    protocol: buildCallProtocol(),
  }));

  if (!result) {
    return undefined;
  }

  call = buildPhoneCall(result.phoneCall);

  sendApiUpdate({
    '@type': 'updatePhoneCall',
    call,
  });

  return true;
}

export async function confirmCall({
  call, gA, keyFingerprint,
}: {
  call: ApiPhoneCall; gA: number[]; keyFingerprint: string;
}) {
  const result = await invokeRequest(new GramJs.phone.ConfirmCall({
    peer: buildInputPhoneCall(call),
    gA: Buffer.from(gA),
    keyFingerprint: BigInt(keyFingerprint),
    protocol: buildCallProtocol(),
  }));

  if (!result) {
    return undefined;
  }

  call = buildPhoneCall(result.phoneCall);

  sendApiUpdate({
    '@type': 'updatePhoneCall',
    call,
  });

  return true;
}

export function sendSignalingData({
  data, call,
}: {
  data: number[]; call: ApiPhoneCall;
}) {
  return invokeRequest(new GramJs.phone.SendSignalingData({
    data: Buffer.from(data),
    peer: buildInputPhoneCall(call),
  }));
}
