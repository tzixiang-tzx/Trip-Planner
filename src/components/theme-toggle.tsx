"use client";

import { useId, useLayoutEffect, useState } from "react";
import { InlineScript } from "@/components/inline-script";
import {
  DEFAULT_THEME,
  THEME_OPTIONS,
  applyTheme,
  readTheme,
  saveTheme,
  themeToggleScript,
  type Theme,
} from "@/lib/theme";

const ICONS: Record<Theme, () => React.ReactElement> = {
  system: () => (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  light: () => (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
    </>
  ),
  dark: () => <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2Z" />,
};

export function ThemeToggle() {
  const groupId = useId();
  const idPrefix = `${groupId}-theme-`;

  // Reads the same key as the inline scripts, so the markup the browser has
  // already fixed up and React's first client render agree.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? DEFAULT_THEME : readTheme(),
  );

  // Before paint rather than after: on a soft navigation the inline script
  // doesn't run, and in development React wipes the attribute the <head>
  // script set when it remounts the tree.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
    saveTheme(next);
  }

  return (
    <fieldset className="flex shrink-0 items-center gap-0.5 rounded-pill border border-line bg-paper/70 p-0.5">
      <legend className="sr-only">Theme</legend>

      {THEME_OPTIONS.map(({ value, label }) => {
        const Icon = ICONS[value];
        return (
          <label key={value} title={label} className="rounded-pill transition hover:bg-sand-deep">
            <input
              type="radio"
              name={groupId}
              id={`${idPrefix}${value}`}
              value={value}
              checked={theme === value}
              onChange={() => choose(value)}
              className="peer sr-only"
            />
            <span className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-pill text-muted transition peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-lagoon">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <Icon />
              </svg>
            </span>
            <span className="sr-only">{label}</span>
          </label>
        );
      })}

      <InlineScript html={themeToggleScript(idPrefix)} />
    </fieldset>
  );
}
