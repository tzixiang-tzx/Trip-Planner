"use client";

import { useState } from "react";
import { addItineraryItem } from "@/actions/itinerary";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";
import { PlanFields } from "./plan-fields";

export function AddPlanForm({ days, defaultDay }: { days: string[]; defaultDay?: string }) {
  const [open, setOpen] = useState(false);

  async function handle(formData: FormData) {
    await addItineraryItem(formData);
    setOpen(false);
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>+</span> Add a plan
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a plan"
        description="Times are the group's local time — keep it loose."
      >
        <form action={handle}>
          <PlanFields days={days} values={{ day: defaultDay }} />
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <SubmitButton pendingLabel="Adding…">Add to itinerary</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
