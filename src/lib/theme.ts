/**
 * Light / dark / system, remembered in localStorage.
 *
 * "system" means no `data-theme` attribute at all, which lets the
 * `prefers-color-scheme` block in globals.css decide; "light" and "dark" set
 * the attribute and win over it.
 */

export const THEME_KEY = "wanderlist:theme";

export const THEME_OPTIONS = [
  { value: "system", label: "Match system" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export type Theme = (typeof THEME_OPTIONS)[number]["value"];

export const DEFAULT_THEME: Theme = "system";

function asTheme(value: string | null): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : DEFAULT_THEME;
}

/** Reads the saved choice, treating anything unexpected as the default. */
export function readTheme(): Theme {
  try {
    return asTheme(localStorage.getItem(THEME_KEY));
  } catch {
    // Private mode, blocked storage — just follow the system.
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Nothing to do: the choice simply won't outlive the tab.
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

const KEY = JSON.stringify(THEME_KEY);

/**
 * Runs inline in <head> while the browser parses the page, so a saved choice
 * is on <html> before the first paint — see
 * `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`.
 */
export const themeInitScript =
  `(function(){try{var t=localStorage.getItem(${KEY});` +
  `if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * The matching fix-up for the toggle itself: the server can't know the saved
 * choice, so it renders "system" selected and this re-checks the right radio
 * before paint. Reads the same key as {@link readTheme}, so the DOM and the
 * component's initial state always agree.
 */
export function themeToggleScript(optionIdPrefix: string) {
  return (
    `(function(){try{var t=localStorage.getItem(${KEY});` +
    `if(t!=="light"&&t!=="dark"&&t!=="system")t=${JSON.stringify(DEFAULT_THEME)};` +
    `var el=document.getElementById(${JSON.stringify(optionIdPrefix)}+t);` +
    `if(el)el.checked=true}catch(e){}})()`
  );
}
