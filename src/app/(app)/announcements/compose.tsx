"use client";

import { useState } from "react";
import { createAnnouncement } from "@/actions/announcements";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

export function ComposeAnnouncement() {
  const [open, setOpen] = useState(false);

  async function handle(formData: FormData) {
    await createAnnouncement(formData);
    setOpen(false);
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>+</span> New announcement
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New announcement"
        description="Everyone on the trip will see this."
      >
        <form action={handle} className="space-y-4">
          <div>
            <label className="label-xs" htmlFor="title">
              Headline
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="Meeting at the station lockers, 8am"
              className="field mt-1.5"
            />
          </div>

          <div>
            <label className="label-xs" htmlFor="body">
              Details
            </label>
            <textarea
              id="body"
              name="body"
              rows={5}
              required
              placeholder="The bit everyone needs to know."
              className="field mt-1.5 resize-y"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-muted">
            <input type="checkbox" name="pinned" className="h-4 w-4 accent-[var(--c-sun)]" />
            Pin to the top — this one really matters
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <SubmitButton pendingLabel="Posting…">Post it</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
