"use client";

import { useState } from "react";
import { deleteExpense, updateExpense } from "@/actions/expenses";
import { formatMoney, minorUnitsPer } from "@/lib/money";
import { formatDay } from "@/lib/dates";
import { Avatar } from "@/components/avatar";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";
import { ExpenseFields } from "./expense-fields";

type Member = { id: string; name: string; accent: string };

type Row = {
  id: string;
  description: string;
  notes: string;
  amountCents: number;
  category: string;
  categoryLabel: string;
  categoryChip: string;
  spentOn: string;
  paidById: string;
  paidByName: string;
  paidByAccent: string;
  yourShareCents: number;
  shares: { userId: string; name: string; accent: string; shareCents: number }[];
};

export function ExpenseTable({
  rows,
  currency,
  members,
  currentUserId,
}: {
  rows: Row[];
  currency: string;
  members: Member[];
  currentUserId: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  if (rows.length === 0) {
    return (
      <section className="card px-6 py-16 text-center">
        <p className="font-display text-xl text-ink">No costs logged yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Add the first one and the balances will start keeping themselves.
        </p>
      </section>
    );
  }

  async function handleUpdate(formData: FormData) {
    await updateExpense(formData);
    setEditing(null);
  }

  async function handleDelete(formData: FormData) {
    await deleteExpense(formData);
    setDeleting(null);
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-sand/40 px-5 py-3.5">
        <h3 className="font-display text-lg text-ink">Every cost</h3>
        <p className="text-xs text-muted">Tap a row to see the breakdown</p>
      </div>

      {/* Column headings, desktop only */}
      <div className="hidden border-b border-line px-5 py-2 sm:grid sm:grid-cols-[7rem_1fr_9rem_7rem_7rem_2.5rem] sm:gap-3">
        <span className="label-xs">Date</span>
        <span className="label-xs">Item</span>
        <span className="label-xs">Paid by</span>
        <span className="label-xs text-right">Your share</span>
        <span className="label-xs text-right">Total</span>
        <span className="sr-only">Actions</span>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((row) => {
          const isOpen = expanded === row.id;
          return (
            <li key={row.id}>
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(isOpen ? null : row.id);
                  }
                }}
                className="group grid cursor-pointer grid-cols-2 gap-x-3 gap-y-1.5 px-5 py-4 transition hover:bg-sand/40 sm:grid-cols-[7rem_1fr_9rem_7rem_7rem_2.5rem] sm:items-center sm:gap-3"
              >
                <span className="order-1 text-xs text-muted sm:text-sm">
                  {formatDay(new Date(`${row.spentOn}T00:00:00.000Z`), "short")}
                </span>

                <div className="order-3 col-span-2 min-w-0 sm:order-2 sm:col-span-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{row.description}</p>
                    <span className={`chip border-transparent ${row.categoryChip}`}>{row.categoryLabel}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    split {row.shares.length} {row.shares.length === 1 ? "way" : "ways"}
                    {row.notes ? ` · ${row.notes}` : ""}
                  </p>
                </div>

                <div className="order-4 flex items-center gap-2 sm:order-3">
                  <Avatar name={row.paidByName} accent={row.paidByAccent} size="sm" />
                  <span className="truncate text-sm text-muted">{row.paidByName}</span>
                </div>

                <span className="order-5 text-right font-mono text-sm text-clay">
                  {row.yourShareCents > 0 ? formatMoney(row.yourShareCents, currency) : "—"}
                </span>

                <span className="order-2 text-right font-mono text-base text-ink sm:order-6">
                  {formatMoney(row.amountCents, currency)}
                </span>

                <span
                  aria-hidden
                  className={`order-6 hidden justify-self-end text-muted transition sm:order-7 sm:block ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ⌄
                </span>
              </div>

              {isOpen && (
                <div className="rise border-t border-line bg-sand/30 px-5 py-4">
                  <p className="label-xs">Breakdown</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {row.shares.map((share) => (
                      <li
                        key={share.userId}
                        className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3.5 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar name={share.name} accent={share.accent} size="sm" />
                          <span className="truncate text-sm text-ink">{share.name}</span>
                        </div>
                        <span className="shrink-0 font-mono text-sm text-muted">
                          {formatMoney(share.shareCents, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-muted">
                      {row.paidByName} paid {formatMoney(row.amountCents, currency)} up front.
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="rounded-full px-3 py-1.5 text-xs text-muted transition hover:bg-sand hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(row)}
                        className="rounded-full px-3 py-1.5 text-xs text-muted transition hover:bg-clay-soft hover:text-clay"
                      >
                        Delete this cost
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit cost"
        description="Whoever paid, and who it was for."
      >
        {editing && (
          <form action={handleUpdate} className="space-y-4">
            <input type="hidden" name="id" value={editing.id} />
            <ExpenseFields
              members={members}
              currency={currency}
              currentUserId={currentUserId}
              values={{
                description: editing.description,
                amount: (editing.amountCents / minorUnitsPer(currency)).toString(),
                spentOn: editing.spentOn,
                paidById: editing.paidById,
                category: editing.category,
                notes: editing.notes,
                participants: editing.shares.map((s) => s.userId),
              }}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this cost?"
        description={
          deleting
            ? `"${deleting.description}" (${formatMoney(deleting.amountCents, currency)}) will be removed and everyone's balance will be recalculated. This can't be undone.`
            : undefined
        }
      >
        {deleting && (
          <form action={handleDelete} className="flex justify-end gap-2">
            <input type="hidden" name="id" value={deleting.id} />
            <button type="button" className="btn btn-ghost" onClick={() => setDeleting(null)}>
              Keep it
            </button>
            <SubmitButton className="btn btn-primary" pendingLabel="Deleting…">
              Yes, delete it
            </SubmitButton>
          </form>
        )}
      </Modal>
    </section>
  );
}
