import { HorizonScene } from "@/components/scenery";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  { title: "Itinerary", note: "Day by day, hour by hour", tint: "text-sea" },
  { title: "Announcements", note: "Say it once, everyone sees it", tint: "text-clay" },
  { title: "Costs", note: "Split fairly, settle simply", tint: "text-sage" },
  { title: "Gallery", note: "Upload once, everyone downloads", tint: "text-sun" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center gap-10 px-5 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-16">
      <section className="rise max-w-lg lg:flex-1">
        <div className="flex items-center justify-between gap-4">
          <p className="label-xs">Wanderlist</p>
          <ThemeToggle />
        </div>

        <h1 className="mt-4 font-display text-[2.6rem] leading-[1.05] text-ink sm:text-6xl">
          Everything about the trip,
          <span className="text-clay"> in one calm place.</span>
        </h1>

        <p className="handwrite mt-4 text-clay">the group chat can finally rest</p>

        <div className="mt-7 overflow-hidden rounded-[var(--radius-soft)] border border-line shadow-[0_18px_40px_-26px_rgb(var(--c-shadow)/0.5)]">
          <HorizonScene className="h-40 w-full sm:h-52" />
        </div>

        <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-muted">
          The plan for each day, the notices nobody should miss, an honest tally of who paid for what,
          and every photo from the road — kept together for the people you&apos;re travelling with.
        </p>

        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((item) => (
            <li key={item.title} className="card px-4 py-3">
              <p className={`font-display text-base ${item.tint}`}>{item.title}</p>
              <p className="mt-0.5 text-xs text-muted">{item.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rise w-full lg:max-w-md lg:flex-1">{children}</section>
    </main>
  );
}
