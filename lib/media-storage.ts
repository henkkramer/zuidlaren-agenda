import "server-only";

import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { inspectImage, validateMediaUploadSize, type ImageInfo } from "@/lib/media-validation";

export type StoredMediaFile = ImageInfo & {
  filename: string;
  publicUrl: string;
  sizeBytes: number;
  storageKey: string;
};

export async function storeLocalMedia(file: File): Promise<StoredMediaFile> {
  validateMediaUploadSize(file.size);

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
