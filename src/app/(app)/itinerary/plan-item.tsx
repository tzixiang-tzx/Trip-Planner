"use client";

import { useState } from "react";
import { deleteItineraryItem, updateItineraryItem } from "@/actions/itinerary";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";
import { PlanFields, type PlanValues } from "./plan-fields";

export function PlanItem({ item, days }: { item: PlanValues & { id: string }; days: string[] }) {
  const [open, setOpen] = useState(false);

  async function handleUpdate(formData: FormData) {
    await updateItineraryItem(formData);
    setOpen(false);
  }

  return (
    <div className="flex shrink-0 items-start gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100 sm:opacity-60">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full px-2.5 py-1 text-xs text-muted transition hover:bg-sand hover:text-ink"
      >
        Edit
      </button>

      <form action={deleteItineraryItem}>
        <input type="hidden" name="id" value={item.id} />
        <button
          type="submit"
          className="rounded-full px-2.5 py-1 text-xs text-muted transition hover:bg-clay-soft hover:text-clay"
        >
          Remove
        </button>
      </form>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit plan">
        <form action={handleUpdate}>
          <input type="hidden" name="id" value={item.id} />
          <PlanFields days={days} values={item} />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
