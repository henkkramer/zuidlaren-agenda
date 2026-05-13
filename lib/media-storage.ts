import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const maxUploadBytes = 5 * 1024 * 1024;
const maxDimension = 6000;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

type ImageInfo = {
  extension: string;
  height?: number;
  mimeType: string;
  width?: number;
};

export type StoredMediaFile = ImageInfo & {
  filename: string;
  publicUrl: string;
  sizeBytes: number;
  storageKey: string;
};

function readPngDimensions(bytes: Uint8Array) {
  if (bytes.length < 24) return {};
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  };
}

function readWebpDimensions(bytes: Uint8Array) {
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (riff !== "RIFF" || webp !== "WEBP") return {};

  const type = String.fromCharCode(...bytes.slice(12, 16));
  if (type === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
      height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
    };
  }

  return {};
}

function readJpegDimensions(bytes: Uint8Array) {
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];

    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8],
      };
    }

    offset += 2 + length;
  }

  return {};
}

export function inspectImage(bytes: Uint8Array, declaredMimeType: string, originalName: string): ImageInfo {
  const extension = originalName.split(".").pop()?.toLowerCase() ?? "";
  const expectedExtension = allowedTypes.get(declaredMimeType);

  if (!expectedExtension) {
    throw new Error("Alleen JPEG, PNG en WebP zijn toegestaan");
  }

  const validExtension =
    extension === expectedExtension || (declaredMimeType === "image/jpeg" && (extension === "jpeg" || extension === "jpg"));

  if (!validExtension) {
    throw new Error("Bestandsextensie past niet bij het afbeeldingstype");
  }

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";

  if ((declaredMimeType === "image/jpeg" && !isJpeg) || (declaredMimeType === "image/png" && !isPng) || (declaredMimeType === "image/webp" && !isWebp)) {
    throw new Error("Bestandsinhoud komt niet overeen met het afbeeldingstype");
  }

  const dimensions =
    declaredMimeType === "image/png" ? readPngDimensions(bytes) : declaredMimeType === "image/webp" ? readWebpDimensions(bytes) : readJpegDimensions(bytes);

  if ((dimensions.width && dimensions.width > maxDimension) || (dimensions.height && dimensions.height > maxDimension)) {
    throw new Error("Afbeelding is te groot in pixels");
  }

  return {
    extension: expectedExtension,
    mimeType: declaredMimeType,
    ...dimensions,
  };
}

export async function storeLocalMedia(file: File): Promise<StoredMediaFile> {
  if (file.size > maxUploadBytes) {
    throw new Error("Afbeelding is groter dan 5 MB");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const info = inspectImage(bytes, file.type, file.name);
  const filename = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${info.extension}`;
  const storageKey = `uploads/media/${filename}`;
  const outputDirectory = path.join(process.cwd(), "public", "uploads", "media");
  const outputPath = path.join(process.cwd(), "public", storageKey);

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, bytes);

  return {
    ...info,
    filename,
    publicUrl: `/${storageKey}`,
    sizeBytes: file.size,
    storageKey,
  };
}

export async function deleteLocalMedia(storageKey: string) {
  if (!storageKey.startsWith("uploads/media/")) {
    return;
  }

  await unlink(path.join(process.cwd(), "public", storageKey)).catch(() => undefined);
}
