/**
 * Decorative artwork. All of it is inline SVG using the theme's CSS variables,
 * so it re-tints itself in dark mode and adds no network requests.
 */

/** A wide horizon: sun, hills, sea and a palm leaning in from the right. */
export function HorizonScene({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 320"
      role="img"
      aria-label="An illustrated horizon with a low sun over the sea"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id="wl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-sun-soft)" />
          <stop offset="55%" stopColor="var(--c-clay-soft)" />
          <stop offset="100%" stopColor="var(--c-sea-soft)" />
        </linearGradient>
        <linearGradient id="wl-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-sea)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--c-lagoon)" stopOpacity="0.28" />
        </linearGradient>
        <clipPath id="wl-frame">
          <rect x="0" y="0" width="800" height="320" rx="20" />
        </clipPath>
      </defs>

      <g clipPath="url(#wl-frame)">
        <rect width="800" height="320" fill="url(#wl-sky)" />

        {/* sun */}
        <circle cx="238" cy="150" r="54" fill="var(--c-sun)" opacity="0.85" />
        <circle cx="238" cy="150" r="78" fill="var(--c-sun)" opacity="0.16" />
        <circle cx="238" cy="150" r="104" fill="var(--c-sun)" opacity="0.09" />

        {/* birds */}
        <g stroke="var(--c-ink)" strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round">
          <path d="M470 78 q10 -9 20 0 q10 -9 20 0" />
          <path d="M534 104 q7 -6 14 0 q7 -6 14 0" />
        </g>

        {/* far hills */}
        <path d="M0 214 q120 -66 246 -14 q118 49 232 -8 q150 -74 322 6 v122 H0 Z" fill="var(--c-sea)" opacity="0.32" />
        <path d="M0 236 q160 -50 300 -6 q140 44 268 -12 q120 -52 232 10 v100 H0 Z" fill="var(--c-sage)" opacity="0.34" />

        {/* sea */}
        <rect y="252" width="800" height="68" fill="url(#wl-sea)" />
        <g stroke="var(--c-paper)" strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round">
          <path d="M40 274 q14 -8 28 0 t28 0" />
          <path d="M300 288 q14 -8 28 0 t28 0" />
          <path d="M600 270 q14 -8 28 0 t28 0" />
          <path d="M180 300 q14 -8 28 0 t28 0" />
          <path d="M690 296 q14 -8 28 0 t28 0" />
        </g>

        {/* palm, leaning in from the right */}
        <g fill="var(--c-sage)" opacity="0.62">
          <path d="M742 320 q-6 -74 22 -128 l11 5 q-24 56 -18 123 Z" />
          <path d="M770 190 q-46 -30 -86 -18 q40 -30 90 4 Z" />
          <path d="M772 188 q-16 -50 -54 -70 q52 12 66 66 Z" />
          <path d="M776 190 q30 -44 78 -46 q-44 20 -66 54 Z" />
          <path d="M778 196 q44 -12 82 16 q-48 -8 -78 -4 Z" />
        </g>
      </g>
    </svg>
  );
}

/** A small paper-plane flight path, used as a section divider. */
export function FlightDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="flight-path flex-1" />
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none">
        <path
          d="M2 12 L22 3 L15 21 L12 13 Z"
          stroke="var(--c-sea)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="var(--c-sea-soft)"
        />
      </svg>
      <span className="flight-path flex-1" />
    </div>
  );
}

/** A postmark-style ring, for the invite code. */
export function Postmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--c-clay)" strokeWidth="2" strokeDasharray="5 6" opacity="0.5" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="var(--c-clay)" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}
