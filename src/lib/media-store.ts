import "server-only";
import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import { db } from "@/lib/db";
import {
  MAX_UPLOAD_BYTES,
  ensureUploadDir,
  extensionFor,
  isAllowedType,
  kindFor,
  resolveStoredPath,
} from "@/lib/storage";

export type SaveResult = { uploaded: number; skipped: string[] };

/**
 * Writes each file to the uploads directory and records it against the trip.
 * Unsupported or oversized files are skipped by name rather than failing the
 * whole batch — one bad file shouldn't lose the other nineteen.
 */
export async function saveUploads(
  tripId: string,
  uploaderId: string,
  files: File[],
  caption: string,
): Promise<SaveResult> {
  await ensureUploadDir();

  let uploaded = 0;
  const skipped: string[] = [];

  for (const file of files) {
    if (!isAllowedType(file.type)) {
      skipped.push(`${file.name} (unsupported format)`);
      continue;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      skipped.push(`${file.name} (over 256 MB)`);
      continue;
    }

    const storedName = `${randomUUID()}${extensionFor(file.type)}`;
    const target = resolveStoredPath(storedName);
    if (!target) {
      skipped.push(`${file.name} (could not be stored)`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(target, buffer);

    await db.mediaItem.create({
      data: {
        tripId,
        uploaderId,
        storedName,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        kind: kindFor(file.type),
        caption,
      },
    });

    uploaded += 1;
  }

  return { uploaded, skipped };
}

/** Removes a media item and its file, but only for the person who uploaded it. */
export async function removeUpload(id: string, tripId: string, uploaderId: string): Promise<boolean> {
  const item = await db.mediaItem.findFirst({ where: { id, tripId, uploaderId } });
  if (!item) return false;

  await db.mediaItem.delete({ where: { id: item.id } });

  const target = resolveStoredPath(item.storedName);
  if (target) {
    await unlink(target).catch(() => {
      // file already gone — the database row is what matters
    });
  }

  return true;
}
