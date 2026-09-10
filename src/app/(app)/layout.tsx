import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { formatRange, tripStatus } from "@/lib/dates";
import { Avatar } from "@/components/avatar";
import { Nav } from "@/components/nav";
import { SignOutButton } from "@/components/sign-out";

const TONE_CLASSES = {
  sun: "bg-sun-soft text-sun",
  sage: "bg-sage-soft text-sage",
  sea: "bg-sea-soft text-sea",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { trip, user } = await requireTrip();

  const members = await db.membership.findMany({
    where: { tripId: trip.id },
    include: { user: { select: { id: true, name: true, accent: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const status = tripStatus(trip.startDate, trip.endDate);

  return (
    <div className="min-h-dvh">
      {/* Postcard banner — the trip, at a glance */}
      <div className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(120deg,var(--c-sun-soft),var(--c-clay-soft)_46%,var(--c-sea-soft))]"
        />
        <div
          aria-hidden
          className="absolute -top-16 -left-10 h-56 w-56 rounded-full bg-sun opacity-25 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -right-16 -bottom-24 h-64 w-64 rounded-full bg-lagoon opacity-20 blur-2xl"
        />

        <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <p className="label-xs">{trip.destination}</p>
              <h1 className="mt-1.5 font-display text-[2rem] leading-tight text-ink sm:text-[2.6rem]">
                {trip.name}
              </h1>
              {trip.blurb && <p className="handwrite mt-1 text-clay">{trip.blurb}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{formatRange(trip.startDate, trip.endDate)}</span>
                <span aria-hidden>·</span>
                <span className={`chip border-transparent ${TONE_CLASSES[status.tone]}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {members.map((m) => (
                  <Avatar key={m.id} name={m.user.name} accent={m.user.accent} size="md" />
                ))}
              </div>
              <p className="text-xs text-muted">
                {members.length} {members.length === 1 ? "traveller" : "travellers"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slim sticky bar, so the nav is always within reach */}
      <header className="sticky top-0 z-30 border-b border-line bg-sand/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-5 py-2.5">
          <Nav />
          <div className="ml-auto flex shrink-0 items-center gap-2.5">
            <Avatar name={user.name} accent={user.accent} size="sm" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-ink">{user.name}</p>
              <SignOutButton />
            </div>
            <div className="sm:hidden">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-10">{children}</main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-10 text-center text-xs text-muted">
        Invite code <span className="font-mono tracking-[0.2em] text-ink">{trip.inviteCode}</span> — share
        it with anyone still joining.
      </footer>
    </div>
  );
}
