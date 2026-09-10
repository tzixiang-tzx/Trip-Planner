import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { StartPanels } from "./start-panels";

export default async function StartPage() {
  const user = await requireUser();

  // Already on a trip? Nothing to do here.
  const membership = await db.membership.findFirst({ where: { userId: user.id }, select: { id: true } });
  if (membership) redirect("/itinerary");

  const anyTripExists = (await db.trip.count()) > 0;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-5 py-12">
      <div className="rise">
        <p className="label-xs">Wanderlist</p>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Hello {user.name.split(" ")[0]} — where are we going?
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted">
          You&apos;re signed in but not on a trip yet. Start one of your own, or join the one your
          friends have already set up.
        </p>

        <StartPanels defaultToJoin={anyTripExists} />
      </div>
    </main>
  );
}
