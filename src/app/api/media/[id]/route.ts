import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { resolveStoredPath } from "@/lib/storage";

/**
 * Serves trip media. Files live outside /public precisely so that every read
 * passes through this check: you must be signed in and on the trip.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not signed in", { status: 401 });

  const { id } = await params;

  const item = await db.mediaItem.findUnique({ where: { id } });
  if (!item) return new Response("Not found", { status: 404 });

  const membership = await db.membership.findUnique({
    where: { userId_tripId: { userId: user.id, tripId: item.tripId } },
    select: { id: true },
  });
  if (!membership) return new Response("Not found", { status: 404 });

  const filePath = resolveStoredPath(item.storedName);
  if (!filePath) return new Response("Not found", { status: 404 });

  let size: number;
  try {
    size = (await stat(filePath)).size;
  } catch {
    return new Response("File is missing from storage", { status: 410 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";
  const disposition = download
    ? `attachment; filename*=UTF-8''${encodeURIComponent(item.originalName)}`
    : "inline";

  const headers = new Headers({
    "Content-Type": item.mimeType,
    "Content-Disposition": disposition,
    "Cache-Control": "private, max-age=3600",
    "Accept-Ranges": "bytes",
  });

  // Range requests let the browser scrub through a video without pulling it whole.
  const range = request.headers.get("range");
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);

  if (match && !download) {
    const start = match[1] ? Number.parseInt(match[1], 10) : 0;
    const end = match[2] ? Number.parseInt(match[2], 10) : size - 1;

    if (Number.isNaN(start) || Number.isNaN(end) || start >= size || start > end) {
      return new Response("Range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }

    const cappedEnd = Math.min(end, size - 1);
    headers.set("Content-Range", `bytes ${start}-${cappedEnd}/${size}`);
    headers.set("Content-Length", String(cappedEnd - start + 1));

    const stream = Readable.toWeb(createReadStream(filePath, { start, end: cappedEnd }));
    return new Response(stream as ReadableStream, { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  const stream = Readable.toWeb(createReadStream(filePath));
  return new Response(stream as ReadableStream, { status: 200, headers });
}
