"use client";

import { useActionState, useRef, useState } from "react";
import { uploadMedia } from "@/actions/media";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

export function UploadMedia() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction] = useActionState(uploadMedia, undefined);

  function close() {
    setOpen(false);
    setChosen([]);
  }

  /** Drag-and-drop writes into the real file input so the form submits it. */
  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!inputRef.current) return;
    inputRef.current.files = event.dataTransfer.files;
    setChosen(Array.from(event.dataTransfer.files));
  }

  const totalMb = chosen.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>↑</span> Upload
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Add to the gallery"
        description="Photos and videos, straight from the trip."
      >
        <form action={formAction} className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragging ? "border-sage bg-sage-soft" : "border-line bg-sand/40 hover:border-sage"
            }`}
          >
            <p className="font-display text-lg text-ink">Drop them here</p>
            <p className="mt-1 text-sm text-muted">or click to browse — you can pick several at once</p>
            <p className="mt-3 text-[0.7rem] text-muted">
              JPG, PNG, WebP, GIF, HEIC · MP4, MOV, WebM, MKV · up to 256 MB each
            </p>

            <input
              ref={inputRef}
              type="file"
              name="files"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setChosen(Array.from(e.target.files ?? []))}
              className="hidden"
            />
          </div>

          {chosen.length > 0 && (
            <div className="rounded-xl border border-line bg-sand/50 p-3.5">
              <p className="label-xs">
                {chosen.length} {chosen.length === 1 ? "file" : "files"} · {totalMb.toFixed(1)} MB
              </p>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                {chosen.map((file) => (
                  <li key={file.name} className="truncate text-xs text-muted">
                    {file.type.startsWith("video/") ? "▸" : "▪"} {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="label-xs" htmlFor="caption">
              Caption (optional)
            </label>
            <input
              id="caption"
              name="caption"
              placeholder="Sunrise from the ryokan window"
              className="field mt-1.5"
            />
          </div>

          {state?.error && (
            <p className="rounded-xl border border-clay/30 bg-clay-soft px-3.5 py-2.5 text-sm text-clay">
              {state.error}
            </p>
          )}

          {state?.uploaded ? (
            <p className="rounded-xl border border-sage/30 bg-sage-soft px-3.5 py-2.5 text-sm text-sage">
              Added {state.uploaded} {state.uploaded === 1 ? "file" : "files"} to the gallery.
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Done
            </button>
            <SubmitButton pendingLabel="Uploading…">
              Upload {chosen.length > 0 ? `${chosen.length}` : ""}
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
