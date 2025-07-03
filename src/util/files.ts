// Polyfill for Safari: `File` is not available in web worker
if (typeof File === 'undefined') {
  self.File = class extends Blob {
    name: string;

    constructor(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag) {
      if (options) {
        const { type, ...rest } = options;
        super(fileBits, { type });
        Object.assign(this, rest);
      } else {
        super(fileBits);
      }

      this.name = fileName;
    }
  } as typeof File;
}

export function blobToFile(blob: Blob, fileName: string) {
  return new File([blob], fileName, {
    lastModified: Date.now(),
    type: blob.type,
  });
}

export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function fetchBlob(blobUrl: string) {
  const response = await fetch(blobUrl);
  return response.blob();
}

export async function fetchFile(blobUrl: string, fileName: string) {
  const blob = await fetchBlob(blobUrl);
  return blobToFile(blob, fileName);
}

export function imgToCanvas(img: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  return canvas;
}

export function validateFiles(files: File[] | FileList | null): File[] | undefined {
  if (!files?.length) {
    return undefined;
  }
  return Array.from(files).map(fixMovMime).filter((file) => file.size);
}

// .mov MIME type not reported sometimes https://developer.mozilla.org/en-US/docs/Web/API/File/type#sect1
function fixMovMime(file: File) {
  const ext = file.name.split('.').pop()!;
  if (!file.type && ext.toLowerCase() === 'mov') {
    return new File([file], file.name, { type: 'video/quicktime' });
  }
  return file;
}
