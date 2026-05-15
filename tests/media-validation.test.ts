import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectImage, maxUploadBytes, validateMediaUploadSize } from "@/lib/media-validation";

function pngBytes(width: number, height: number) {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function webpBytes(width: number, height: number) {
  const bytes = new Uint8Array(30);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  bytes.set([0x56, 0x50, 0x38, 0x58], 12);
  const encodedWidth = width - 1;
  const encodedHeight = height - 1;
  bytes[24] = encodedWidth & 0xff;
  bytes[25] = (encodedWidth >> 8) & 0xff;
  bytes[26] = (encodedWidth >> 16) & 0xff;
  bytes[27] = encodedHeight & 0xff;
  bytes[28] = (encodedHeight >> 8) & 0xff;
  bytes[29] = (encodedHeight >> 16) & 0xff;
  return bytes;
}

function jpegBytes(width: number, height: number) {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x00]);
}

test("media validation accepts supported image signatures and extracts dimensions", () => {
  assert.deepEqual(inspectImage(pngBytes(1200, 800), "image/png", "banner.png"), {
    extension: "png",
    height: 800,
    mimeType: "image/png",
    width: 1200,
  });

  assert.deepEqual(inspectImage(webpBytes(640, 360), "image/webp", "banner.webp"), {
    extension: "webp",
    height: 360,
    mimeType: "image/webp",
    width: 640,
  });

  assert.deepEqual(inspectImage(jpegBytes(1920, 1080), "image/jpeg", "banner.jpeg"), {
    extension: "jpg",
    height: 1080,
    mimeType: "image/jpeg",
    width: 1920,
  });
});

test("media validation rejects unsupported types and mismatched extensions or content", () => {
  assert.throws(() => inspectImage(pngBytes(100, 100), "image/gif", "banner.gif"), /Alleen JPEG/);
  assert.throws(() => inspectImage(pngBytes(100, 100), "image/png", "banner.jpg"), /Bestandsextensie/);
  assert.throws(() => inspectImage(new Uint8Array([0x00, 0x01, 0x02, 0x03]), "image/png", "banner.png"), /Bestandsinhoud/);
});

test("media validation rejects oversized files and excessive image dimensions", () => {
  assert.doesNotThrow(() => validateMediaUploadSize(maxUploadBytes));
  assert.throws(() => validateMediaUploadSize(maxUploadBytes + 1), /groter dan 5 MB/);
  assert.throws(() => inspectImage(pngBytes(6001, 100), "image/png", "banner.png"), /te groot in pixels/);
  assert.throws(() => inspectImage(webpBytes(100, 6001), "image/webp", "banner.webp"), /te groot in pixels/);
});
