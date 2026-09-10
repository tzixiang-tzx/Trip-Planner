import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { formatBytes } from "@/lib/storage";
import { timeAgo } from "@/lib/dates";
import { UploadMedia } from "./upload-media";
import { GalleryGrid } from "./gallery-grid";

export default async function GalleryPage() {
  const { trip, user } = await requireTrip();

  const items = await db.mediaItem.findMany({
    where: { tripId: trip.id },
    include: { uploader: { select: { id: true, name: true, accent: true } } },
    orderBy: { createdAt: "desc" },
  });

  const photos = items.filter((i) => i.kind === "photo").length;
  const videos = items.length - photos;
  const totalBytes = items.reduce((sum, i) => sum + i.sizeBytes, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Gallery</h2>
          <p className="mt-1 text-sm text-muted">
            {items.length === 0
              ? "Nothing here yet — be the first to drop something in."
              : `${photos} ${photos === 1 ? "photo" : "photos"}, ${videos} ${
                  videos === 1 ? "video" : "videos"
                } · ${formatBytes(totalBytes)}. Anyone on the trip can download the originals.`}
          </p>
        </div>
        <UploadMedia />
      </div>

      <GalleryGrid
        currentUserId={user.id}
        items={items.map((item) => ({
          id: item.id,
          kind: item.kind as "photo" | "video",
          caption: item.caption,
          originalName: item.originalName,
          mimeType: item.mimeType,
          size: formatBytes(item.sizeBytes),
          uploaderId: item.uploader.id,
          uploaderName: item.uploader.name,
          uploaderAccent: item.uploader.accent,
          when: timeAgo(item.createdAt),
        }))}
      />
    </div>
  );
}
