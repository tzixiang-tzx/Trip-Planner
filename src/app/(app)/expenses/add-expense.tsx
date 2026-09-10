"use client";

import { useState } from "react";
import { createExpense } from "@/actions/expenses";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";
import { ExpenseFields } from "./expense-fields";

type Member = { id: string; name: string; accent: string };

export function AddExpense({
  members,
  currency,
  currentUserId,
}: {
  members: Member[];
  currency: string;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  async function handle(formData: FormData) {
    await createExpense(formData);
    setOpen(false);
    setKey((k) => k + 1); // remounts ExpenseFields with fresh internal state next time it opens
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <span aria-hidden>+</span> Add a cost
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a cost"
        description="Whoever paid, and who it was for."
      >
        <form action={handle} className="space-y-4">
          <ExpenseFields key={key} members={members} currency={currency} currentUserId={currentUserId} />

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <SubmitButton pendingLabel="Adding…">Add cost</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
