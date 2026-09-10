const ACCENT_STYLES: Record<string, { bg: string; text: string }> = {
  sage: { bg: "bg-sage-soft", text: "text-sage" },
  clay: { bg: "bg-clay-soft", text: "text-clay" },
  sun: { bg: "bg-sun-soft", text: "text-sun" },
  sea: { bg: "bg-sea-soft", text: "text-sea" },
};

export function accentStyle(accent: string) {
  return ACCENT_STYLES[accent] ?? ACCENT_STYLES.sage;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  sm: "h-7 w-7 text-[0.6rem]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function Avatar({
  name,
  accent = "sage",
  size = "md",
  title,
}: {
  name: string;
  accent?: string;
  size?: keyof typeof SIZES;
  title?: string;
}) {
  const style = accentStyle(accent);
  return (
    <span
      title={title ?? name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line font-semibold tracking-wide ${style.bg} ${style.text} ${SIZES[size]}`}
    >
      {initials(name)}
    </span>
  );
}
