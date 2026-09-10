"use client";

import { useState } from "react";
import { clearTripContent } from "@/actions/trip";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

export function ClearContent({ tripName, hasContent }: { tripName: string; hasContent: boolean }) {
  const [open, setOpen] = useState(false);

  if (!hasContent) return null;

  return (
    <>
      <section className="card border-dashed p-6">
        <h3 className="font-display text-lg text-ink">Starting from scratch?</h3>
        <p className="mt-1.5 text-sm text-muted">
          Clear the plans, announcements and costs so you can fill in your own. Photos, videos and
          everyone&apos;s accounts stay put.
        </p>
        <button type="button" onClick={() => setOpen(true)} className="btn btn-ghost mt-4">
          Clear the sample content
        </button>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Clear the content?"
        description={`Every plan, announcement and cost on ${tripName} will be deleted. This can't be undone.`}
      >
        <form action={clearTripContent} className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
            Keep it
          </button>
          <SubmitButton className="btn btn-primary" pendingLabel="Clearing…">
            Yes, clear it
          </SubmitButton>
        </form>
      </Modal>
    </>
  );
}
