"use client";

import { useMemo, useState } from "react";
import { createExpense } from "@/actions/expenses";
import { COST_CATEGORIES } from "@/lib/categories";
import { formatMoney, splitEvenly, toMinorUnits } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import { Avatar } from "@/components/avatar";
import { Modal } from "@/components/modal";
import { SubmitButton } from "@/components/submit-button";

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
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<string[]>(() => members.map((m) => m.id));

  const amountCents = toMinorUnits(amount, currency);

  // Mirrors the server's split exactly, so the preview is the real answer.
  const preview = useMemo(() => {
    if (amountCents <= 0 || selected.length === 0) return null;
    const parts = splitEvenly(amountCents, selected.length);
    return selected.map((id, i) => ({
      member: members.find((m) => m.id === id),
      shareCents: parts[i],
    }));
  }, [amountCents, selected, members]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  function reset() {
    setAmount("");
    setSelected(members.map((m) => m.id));
  }

  async function handle(formData: FormData) {
    await createExpense(formData);
    setOpen(false);
    reset();
  }

  const everyone = selected.length === members.length;

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
          <div>
            <label className="label-xs" htmlFor="description">
              What was it
            </label>
            <input
              id="description"
              name="description"
              required
              placeholder="Dinner at the izakaya"
              className="field mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-xs" htmlFor="amount">
                Amount ({currency})
              </label>
              <input
                id="amount"
                name="amount"
                required
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="128.40"
                className="field mt-1.5 font-mono"
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="spentOn">
                When
              </label>
              <input
                id="spentOn"
                name="spentOn"
                type="date"
                defaultValue={todayIso()}
                className="field mt-1.5"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-xs" htmlFor="paidById">
                Paid by
              </label>
              <select id="paidById" name="paidById" defaultValue={currentUserId} className="field mt-1.5">
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id === currentUserId ? `${m.name} (you)` : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-xs" htmlFor="category">
                Category
              </label>
              <select id="category" name="category" defaultValue="food" className="field mt-1.5">
                {COST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="label-xs">Split between</span>
              <button
                type="button"
                onClick={() => setSelected(everyone ? [] : members.map((m) => m.id))}
                className="text-xs font-medium text-clay transition hover:underline"
              >
                {everyone ? "Clear all" : "Select everyone"}
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((member) => {
                const on = selected.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggle(member.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-2 rounded-pill border px-2.5 py-1.5 text-sm transition ${
                      on
                        ? "border-transparent bg-ink text-paper"
                        : "border-line bg-transparent text-muted hover:text-ink"
                    }`}
                  >
                    <Avatar name={member.name} accent={member.accent} size="sm" />
                    {member.id === currentUserId ? "You" : member.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>

            {selected.map((id) => (
              <input key={id} type="hidden" name="participants" value={id} />
            ))}
          </div>

          {preview && (
            <div className="rounded-xl border border-line bg-sand/50 p-4">
              <p className="label-xs">The split</p>
              <ul className="mt-2.5 space-y-1.5">
                {preview.map((row) => (
                  <li key={row.member?.id} className="flex justify-between text-sm">
                    <span className="text-muted">{row.member?.name}</span>
                    <span className="font-mono text-ink">{formatMoney(row.shareCents, currency)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2.5 text-[0.7rem] text-muted">
                {formatMoney(amountCents, currency)} split {selected.length}{" "}
                {selected.length === 1 ? "way" : "ways"} — odd cents go to the top of the list, so the
                total always matches to the cent.
              </p>
            </div>
          )}

          <div>
            <label className="label-xs" htmlFor="notes">
              Notes (optional)
            </label>
            <input
              id="notes"
              name="notes"
              placeholder="Paid in cash, receipt in the group chat"
              className="field mt-1.5"
            />
          </div>

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
