declare const process: NodeJS.Process;

declare module '*.module.scss';

declare const APP_VERSION: string;

declare namespace React {

  interface MouseEvent {
    offsetX: number;
    offsetY: number;
  }

  interface KeyboardEvent {
    isComposing: boolean;
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_API_BASE_URL?: string;
  }
}


type AnyLiteral = Record<string, any>;
type AnyClass = new (...args: any[]) => any;
type AnyFunction = (...args: any[]) => any;
type AnyToVoidFunction = (...args: any[]) => void;
type BooleanToVoidFunction = (value: boolean) => void;
type NoneToVoidFunction = () => void;

type EmojiCategory = {
  id: string;
  name: string;
  emojis: string[];
};

type Emoji = {
  id: string;
  names: string[];
  native: string;
  image: string;
  skin?: number;
};

// Declare supported formats as modules
declare module '*.png' {
  const url: string;
  export default url;
}

declare module '*.jpg' {
  const url: string;
  export default url;
}
declare module '*.svg' {
  const url: string;
  export default url;
}
declare module '*.txt' {
  const url: string;
  export default url;
}
declare module '*.tgs' {
  const url: string;
  export default url;
}
declare module '*.wasm' {
  const url: string;
  export default url;
}
declare module '*.strings' {
  const url: string;
  export default url;
}

declare module 'pako/dist/pako_inflate' {
  function inflate(...args: any[]): string;
}

declare module 'opus-recorder' {
  export interface IOpusRecorder extends Omit<MediaRecorder, 'start' | 'ondataavailable'> {
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(options: AnyLiteral): IOpusRecorder;

    start(stream?: MediaStreamAudioSourceNode): void;

    sourceNode: MediaStreamAudioSourceNode;

    ondataavailable: (typedArray: Uint8Array) => void;
  }
}

interface HTMLElement {
  mozRequestFullScreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void>;
}

type Undefined<T> = {
  [K in keyof T]: undefined;
};
type OptionalCombine<A, B> = (A & B) | (A & Undefined<B>);

type CommonProperties<T, U> = {
  [K in keyof T & keyof U]: T[K] & U[K];
};

// Fix to make Boolean() work as !!
// https://github.com/microsoft/TypeScript/issues/16655
type Falsy = false | 0 | '' | null | undefined;

interface BooleanConstructor {
  new<T>(value: T | Falsy): value is T;
  <T>(value: T | Falsy): value is T;
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  readonly prototype: Boolean;
}

interface Array<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: unknown): Exclude<S, Falsy>[];
}

// Missing type definitions for OPFS (Origin Private File System) API
// https://github.com/WICG/file-system-access/blob/main/AccessHandle.md#accesshandle-idl
interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>;
}

interface FileSystemSyncAccessHandle {
  read: (buffer: BufferSource, options: FilesystemReadWriteOptions) => number;
  write: (buffer: BufferSource, options: FilesystemReadWriteOptions) => number;

  truncate: (size: number) => Promise<undefined>;
  getSize: () => Promise<number>;
  flush: () => Promise<undefined>;
  close: () => Promise<undefined>;
}

type FilesystemReadWriteOptions = {
  at: number;
};
