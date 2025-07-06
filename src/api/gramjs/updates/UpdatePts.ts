import type { BigInteger } from 'big-integer';

export class LocalUpdatePts {
  constructor(public pts: number, public ptsCount: number) {}
}

export class LocalUpdateChannelPts {
  constructor(public channelId: BigInteger, public pts: number, public ptsCount: number) {}
}

export type UpdatePts = LocalUpdatePts | LocalUpdateChannelPts;
