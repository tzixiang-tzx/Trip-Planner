import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { formatMoney } from "@/lib/money";
import { settleUp, type Balance } from "@/lib/settle";
import { costCategory } from "@/lib/categories";
import { isoDay } from "@/lib/dates";
import { Avatar } from "@/components/avatar";
import { AddExpense } from "./add-expense";
import { ExpenseTable } from "./expense-table";

export default async function ExpensesPage() {
  const { trip, user } = await requireTrip();

  const [memberships, expenses] = await Promise.all([
    db.membership.findMany({
      where: { tripId: trip.id },
      include: { user: { select: { id: true, name: true, accent: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    db.expense.findMany({
      where: { tripId: trip.id },
      include: {
        paidBy: { select: { id: true, name: true, accent: true } },
        shares: { include: { user: { select: { id: true, name: true, accent: true } } } },
      },
      orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const members = memberships.map((m) => m.user);
  const currency = trip.currency;

  // Everyone starts square; each expense credits the payer and debits the sharers.
  const tally = new Map<string, { paid: number; owed: number }>(
    members.map((m) => [m.id, { paid: 0, owed: 0 }]),
  );

  for (const expense of expenses) {
    const payer = tally.get(expense.paidById);
    if (payer) payer.paid += expense.amountCents;

    for (const share of expense.shares) {
      const entry = tally.get(share.userId);
      if (entry) entry.owed += share.shareCents;
    }
  }

  const balances: Balance[] = members.map((m) => {
    const entry = tally.get(m.id) ?? { paid: 0, owed: 0 };
    return {
      userId: m.id,
      name: m.name,
      paidCents: entry.paid,
      owedCents: entry.owed,
      netCents: entry.paid - entry.owed,
    };
  });

  const transfers = settleUp(balances);
  const totalCents = expenses.reduce((sum, e) => sum + e.amountCents, 0);
  const yourBalance = balances.find((b) => b.userId === user.id);
  const largestSwing = Math.max(1, ...balances.map((b) => Math.abs(b.netCents)));
  const accentOf = new Map(members.map((m) => [m.id, m.accent]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Costs</h2>
          <p className="mt-1 text-sm text-muted">
            Add what you paid for. The split, the balances and the settle-up work themselves out.
          </p>
        </div>
        <AddExpense members={members} currency={currency} currentUserId={user.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="label-xs">Spent together</p>
          <p className="mt-2 font-display text-3xl text-ink">{formatMoney(totalCents, currency)}</p>
          <p className="mt-1 text-xs text-muted">
            across {expenses.length} {expenses.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="card p-5">
          <p className="label-xs">Fair share each</p>
          <p className="mt-2 font-display text-3xl text-ink">
            {formatMoney(members.length > 0 ? Math.round(totalCents / members.length) : 0, currency)}
          </p>
          <p className="mt-1 text-xs text-muted">if everything were split {members.length} ways</p>
        </div>

        <div className="card p-5">
          <p className="label-xs">Where you stand</p>
          <p
            className={`mt-2 font-display text-3xl ${
              !yourBalance || yourBalance.netCents === 0
                ? "text-ink"
                : yourBalance.netCents > 0
                  ? "text-sage"
                  : "text-clay"
            }`}
          >
            {yourBalance && yourBalance.netCents !== 0
              ? formatMoney(Math.abs(yourBalance.netCents), currency)
              : "All square"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {!yourBalance || yourBalance.netCents === 0
              ? "nothing owed either way"
              : yourBalance.netCents > 0
                ? "you are owed this back"
                : "you owe this to the group"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="card p-6">
          <h3 className="font-display text-lg text-ink">Balances</h3>
          <p className="mt-1 text-xs text-muted">Paid in, minus their share of everything.</p>

          <ul className="mt-5 space-y-4">
            {balances.map((balance) => {
              const width = Math.round((Math.abs(balance.netCents) / largestSwing) * 100);
              const positive = balance.netCents > 0;
              return (
                <li key={balance.userId}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={balance.name} accent={accentOf.get(balance.userId) ?? "sage"} size="sm" />
                      <span className="truncate font-medium text-ink">{balance.name}</span>
                    </div>
                    <span
                      className={`shrink-0 font-mono text-sm ${
                        balance.netCents === 0 ? "text-muted" : positive ? "text-sage" : "text-clay"
                      }`}
                    >
                      {balance.netCents === 0
                        ? "—"
                        : `${positive ? "+" : "−"}${formatMoney(Math.abs(balance.netCents), currency)}`}
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-deep">
                    <div
                      className={`h-full rounded-full transition-all ${positive ? "bg-sage" : "bg-clay"}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-[0.7rem] text-muted">
                    paid {formatMoney(balance.paidCents, currency)} · owes{" "}
                    {formatMoney(balance.owedCents, currency)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-6">
          <h3 className="font-display text-lg text-ink">Settle up</h3>
          <p className="mt-1 text-xs text-muted">The fewest transfers that make everyone even.</p>

          {transfers.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="font-display text-2xl text-sage">Everyone is even</p>
              <p className="handwrite mt-1.5 text-muted">nothing to sort out — go enjoy the trip</p>
            </div>
          ) : (
            <ul className="mt-5 space-y-2.5">
              {transfers.map((transfer, i) => (
                <li
                  key={`${transfer.fromId}-${transfer.toId}-${i}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-sand/50 px-3.5 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={transfer.fromName} accent={accentOf.get(transfer.fromId) ?? "clay"} size="sm" />
                    <span className="truncate text-ink">{transfer.fromName}</span>
                    <span className="text-muted" aria-hidden>
                      →
                    </span>
                    <Avatar name={transfer.toName} accent={accentOf.get(transfer.toId) ?? "sage"} size="sm" />
                    <span className="truncate text-ink">{transfer.toName}</span>
                  </div>
                  <span className="shrink-0 font-mono text-ink">
                    {formatMoney(transfer.amountCents, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ExpenseTable
        currency={currency}
        members={members}
        currentUserId={user.id}
        rows={expenses.map((expense) => ({
          id: expense.id,
          description: expense.description,
          notes: expense.notes,
          amountCents: expense.amountCents,
          category: expense.category,
          categoryLabel: costCategory(expense.category).label,
          categoryChip: costCategory(expense.category).chip,
          spentOn: isoDay(expense.spentOn),
          paidById: expense.paidById,
          paidByName: expense.paidBy.name,
          paidByAccent: expense.paidBy.accent,
          yourShareCents: expense.shares.find((s) => s.userId === user.id)?.shareCents ?? 0,
          shares: expense.shares.map((s) => ({
            userId: s.userId,
            name: s.user.name,
            accent: s.user.accent,
            shareCents: s.shareCents,
          })),
        }))}
      />
    </div>
  );
}
