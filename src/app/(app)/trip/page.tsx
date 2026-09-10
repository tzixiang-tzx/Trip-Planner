import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { isoDay, formatRange } from "@/lib/dates";
import { Avatar } from "@/components/avatar";
import { EditTrip } from "./edit-trip";
import { ClearContent } from "./clear-content";

export default async function TripPage() {
  const { trip, user } = await requireTrip();

  const [members, counts] = await Promise.all([
    db.membership.findMany({
      where: { tripId: trip.id },
      include: { user: { select: { id: true, name: true, email: true, accent: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    Promise.all([
      db.itineraryItem.count({ where: { tripId: trip.id } }),
      db.announcement.count({ where: { tripId: trip.id } }),
      db.expense.count({ where: { tripId: trip.id } }),
      db.mediaItem.count({ where: { tripId: trip.id } }),
    ]),
  ]);

  const [plans, announcements, expenses, media] = counts;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl text-ink">Trip details</h2>
        <p className="mt-1 text-sm text-muted">
          The name, dates and currency everything else hangs off.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <EditTrip
          values={{
            name: trip.name,
            destination: trip.destination,
            blurb: trip.blurb,
            startDate: isoDay(trip.startDate),
            endDate: isoDay(trip.endDate),
            currency: trip.currency,
            inviteCode: trip.inviteCode,
          }}
        />

        <div className="space-y-5">
          {/* The invite code, styled like a luggage tag */}
          <section className="card relative overflow-hidden p-6 text-center">
            <p className="label-xs">Invite code</p>
            <p className="mt-3 font-mono text-3xl tracking-[0.3em] text-ink">{trip.inviteCode}</p>
            <p className="mt-3 text-xs text-muted">
              Anyone with this code can join {trip.name} at the sign-up page.
            </p>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full border-8 border-dashed border-sun/25"
            />
          </section>

          <section className="card p-6">
            <h3 className="font-display text-lg text-ink">Who&apos;s coming</h3>
            <ul className="mt-4 space-y-3">
              {members.map((m) => (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.user.name} accent={m.user.accent} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {m.user.name}
                      {m.user.id === user.id && <span className="text-muted"> (you)</span>}
                    </p>
                    <p className="truncate text-xs text-muted">{m.user.email}</p>
                  </div>
                  {m.role === "organiser" && (
                    <span className="chip border-transparent bg-sun-soft text-sun">Organiser</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h3 className="font-display text-lg text-ink">What&apos;s in it</h3>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Plans", plans],
                ["Announcements", announcements],
                ["Costs", expenses],
                ["Photos & videos", media],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl bg-sand/50 px-3.5 py-3">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-0.5 font-display text-2xl text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-muted">
              Running {formatRange(trip.startDate, trip.endDate)}.
            </p>
          </section>

          <ClearContent
            tripName={trip.name}
            hasContent={plans + announcements + expenses > 0}
          />
        </div>
      </div>
    </div>
  );
}
