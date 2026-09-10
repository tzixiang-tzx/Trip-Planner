"use client";

import { useEffect, useState } from "react";
import { deleteMedia } from "@/actions/media";
import { Avatar } from "@/components/avatar";

type Item = {
  id: string;
  kind: "photo" | "video";
  caption: string;
  originalName: string;
  mimeType: string;
  size: string;
  uploaderId: string;
  uploaderName: string;
  uploaderAccent: string;
  when: string;
};

type Filter = "all" | "photo" | "video";

/** Fixed tilts so the wall of photos looks hand-laid rather than gridded. */
const TILTS = [-1.6, 1.1, -0.7, 1.7, -1.2, 0.8];

export function GalleryGrid({
  items,
  currentUserId,
  totalCount,
}: {
  items: Item[];
  currentUserId: string;
  totalCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [lightbox, setLightbox] = useState<Item | null>(null);

  const visible = filter === "all" ? items : items.filter((i) => i.kind === filter);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const index = visible.findIndex((i) => i.id === lightbox.id);
        const next = e.key === "ArrowRight" ? index + 1 : index - 1;
        if (next >= 0 && next < visible.length) setLightbox(visible[next]);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox, visible]);

  if (totalCount === 0) {
    return (
      <div className="card px-6 py-20 text-center">
        <p className="font-display text-xl text-ink">The album is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Everything uploaded here stays private to the trip — only people with an account on it can see or
          download the files.
        </p>
        <p className="handwrite mt-3 text-clay">the good ones go here</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5">
        {(
          [
            ["all", `Everything (${totalCount})`],
            ["photo", "Photos"],
            ["video", "Videos"],
          ] as [Filter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-pill px-3.5 py-1.5 text-xs font-medium transition ${
              filter === value ? "bg-ink text-paper" : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, index) => (
          <figure
            key={item.id}
            style={{ "--tilt": `${TILTS[index % TILTS.length]}deg` } as React.CSSProperties}
            className="polaroid group relative"
          >
            <button
              type="button"
              onClick={() => setLightbox(item)}
              className="relative block aspect-square w-full overflow-hidden rounded-[0.25rem] bg-sand-deep"
              aria-label={`Open ${item.caption || item.originalName}`}
            >
              {item.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/${item.id}`}
                  alt={item.caption || item.originalName}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
              ) : (
                <video
                  src={`/api/media/${item.id}`}
                  preload="metadata"
                  muted
                  playsInline
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                />
              )}

              {item.kind === "video" && (
                <span className="pointer-events-none absolute top-2 left-2 rounded-pill bg-ink/70 px-2 py-0.5 text-[0.65rem] font-medium text-paper backdrop-blur">
                  ▸ Video
                </span>
              )}
            </button>

            <figcaption className="absolute inset-x-2 bottom-1.5 text-center">
              <p className="handwrite truncate text-ink/85">{item.caption || item.uploaderName}</p>
            </figcaption>

            <a
              href={`/api/media/${item.id}?download=1`}
              download={item.originalName}
              onClick={(e) => e.stopPropagation()}
              title={`Download ${item.originalName}`}
              className="absolute top-3 right-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.65rem] font-medium text-ink opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100"
            >
              ↓
            </a>
          </figure>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/90 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4 px-5 py-4 text-paper">
            <div className="min-w-0">
              <p className="truncate font-display text-lg">{lightbox.caption || lightbox.originalName}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-paper/60">
                <Avatar name={lightbox.uploaderName} accent={lightbox.uploaderAccent} size="sm" />
                <span>
                  {lightbox.uploaderName} · {lightbox.when} · {lightbox.size}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Close"
              className="rounded-full px-3 py-1 text-2xl leading-none text-paper/70 transition hover:text-paper"
            >
              ×
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 items-center justify-center px-4 pb-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            {lightbox.kind === "photo" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/media/${lightbox.id}`}
                alt={lightbox.caption || lightbox.originalName}
                className="max-h-full max-w-full rounded-2xl object-contain"
              />
            ) : (
              <video
                src={`/api/media/${lightbox.id}`}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-2xl"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 px-5 pb-6">
            <a
              href={`/api/media/${lightbox.id}?download=1`}
              download={lightbox.originalName}
              className="btn bg-paper text-ink"
            >
              ↓ Download original
            </a>

            {lightbox.uploaderId === currentUserId && (
              <form
                action={async (formData: FormData) => {
                  await deleteMedia(formData);
                  setLightbox(null);
                }}
              >
                <input type="hidden" name="id" value={lightbox.id} />
                <button type="submit" className="btn border-paper/25 text-paper/80 hover:text-paper">
                  Remove
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
