import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { formatDay, isoDay, todayIso, tripDays } from "@/lib/dates";
import { planCategory } from "@/lib/categories";
import { Avatar } from "@/components/avatar";
import { AddPlanForm } from "./add-plan-form";
import { PlanItem } from "./plan-item";

export default async function ItineraryPage() {
  const { trip } = await requireTrip();

  const items = await db.itineraryItem.findMany({
    where: { tripId: trip.id },
    include: { createdBy: { select: { name: true, accent: true } } },
    orderBy: [{ day: "asc" }, { startTime: "asc" }, { createdAt: "asc" }],
  });

  const days = tripDays(trip.startDate, trip.endDate);
  const today = todayIso();

  // Anything scheduled outside the trip window still deserves a place.
  const extraDays = [...new Set(items.map((i) => isoDay(i.day)))].filter((d) => !days.includes(d));
  const allDays = [...days, ...extraDays].sort();

  const byDay = new Map<string, typeof items>();
  for (const item of items) {
    const key = isoDay(item.day);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(item);
    else byDay.set(key, [item]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">The plan</h2>
          <p className="mt-1 text-sm text-muted">
            {items.length === 0
              ? "Nothing booked in yet — add the first thing below."
              : `${items.length} ${items.length === 1 ? "plan" : "plans"} across ${byDay.size} ${
                  byDay.size === 1 ? "day" : "days"
                }.`}
          </p>
        </div>
        <AddPlanForm days={allDays} defaultDay={days.includes(today) ? today : days[0]} />
      </div>

      <div className="space-y-5">
        {allDays.map((day, index) => {
          const dayItems = byDay.get(day) ?? [];
          const isToday = day === today;

          return (
            <section
              key={day}
              className={`card overflow-hidden ${isToday ? "ring-2 ring-sage/40" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-sand/40 px-5 py-3.5">
                <div className="flex items-baseline gap-3">
                  <span className="label-xs">Day {index + 1}</span>
                  <h3 className="font-display text-lg text-ink">
                    {formatDay(new Date(`${day}T00:00:00.000Z`))}
                  </h3>
                </div>
                {isToday && <span className="chip border-transparent bg-sage-soft text-sage">Today</span>}
              </div>

              {dayItems.length === 0 ? (
                <p className="handwrite px-5 py-7 text-center text-muted">
                  a free day — wander, or fill it in
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {dayItems.map((item) => {
                    const category = planCategory(item.category);
                    return (
                      <li key={item.id} className="group px-5 py-4">
                        <div className="flex gap-4">
                          <div className="w-16 shrink-0 pt-0.5 text-right">
                            <p className="font-mono text-sm text-ink">{item.startTime || "—"}</p>
                            {item.endTime && <p className="font-mono text-[0.7rem] text-muted">{item.endTime}</p>}
                          </div>

                          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${category.dot}`} aria-hidden />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-ink">{item.title}</p>
                              <span className={`chip border-transparent ${category.chip}`}>{category.label}</span>
                            </div>
                            {item.location && <p className="mt-0.5 text-sm text-muted">{item.location}</p>}
                            {item.notes && (
                              <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted">
                                {item.notes}
                              </p>
                            )}
                            <div className="mt-2.5 flex items-center gap-2 text-[0.7rem] text-muted">
                              <Avatar name={item.createdBy.name} accent={item.createdBy.accent} size="sm" />
                              <span>added by {item.createdBy.name}</span>
                            </div>
                          </div>

                          <PlanItem item={{ ...item, day: isoDay(item.day) }} days={allDays} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
