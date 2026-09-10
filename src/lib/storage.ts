import "server-only";
import path from "node:path";
import { mkdir } from "node:fs/promises";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const MAX_UPLOAD_BYTES = 256 * 1024 * 1024; // 256 MB per file

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
  "video/x-matroska": ".mkv",
};

export function isAllowedType(mimeType: string): boolean {
  return mimeType in EXTENSIONS;
}

export function extensionFor(mimeType: string): string {
  return EXTENSIONS[mimeType] ?? "";
}

export function kindFor(mimeType: string): "photo" | "video" {
  return mimeType.startsWith("video/") ? "video" : "photo";
}

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

/**
 * Resolve a stored filename to a real path, refusing anything that tries to
 * climb out of the uploads directory.
 */
export function resolveStoredPath(storedName: string): string | null {
  const base = path.basename(storedName);
  if (base !== storedName || base.startsWith(".")) return null;

  const full = path.join(UPLOAD_DIR, base);
  const relative = path.relative(UPLOAD_DIR, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  return full;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}
