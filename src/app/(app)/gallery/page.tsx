import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { formatBytes } from "@/lib/storage";
import { timeAgo } from "@/lib/dates";
import { Pagination } from "@/components/pagination";
import { clampPage, parsePage, skipFor, totalPagesFor, PAGE_SIZE } from "@/lib/pagination";
import { UploadMedia } from "./upload-media";
import { GalleryGrid } from "./gallery-grid";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { trip, user } = await requireTrip();
  const { page: pageParam } = await searchParams;

  const total = await db.mediaItem.count({ where: { tripId: trip.id } });
  const page = clampPage(parsePage(pageParam), total);

  const [photos, sizeAgg, items] = await Promise.all([
    db.mediaItem.count({ where: { tripId: trip.id, kind: "photo" } }),
    db.mediaItem.aggregate({ where: { tripId: trip.id }, _sum: { sizeBytes: true } }),
    db.mediaItem.findMany({
      where: { tripId: trip.id },
      include: { uploader: { select: { id: true, name: true, accent: true } } },
      orderBy: { createdAt: "desc" },
      skip: skipFor(page),
      take: PAGE_SIZE,
    }),
  ]);

  const videos = total - photos;
  const totalBytes = sizeAgg._sum.sizeBytes ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Gallery</h2>
          <p className="mt-1 text-sm text-muted">
            {total === 0
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
        totalCount={total}
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

      <Pagination page={page} totalPages={totalPagesFor(total)} basePath="/gallery" />
    </div>
  );
}
