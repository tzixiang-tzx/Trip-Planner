"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/itinerary", label: "Itinerary" },
  { href: "/announcements", label: "Announcements" },
  { href: "/expenses", label: "Costs" },
  { href: "/gallery", label: "Gallery" },
  { href: "/trip", label: "Trip" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-pill px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
              active
                ? "bg-ink text-paper shadow-[0_8px_20px_-14px_rgba(0,0,0,0.8)]"
                : "text-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
