/**
 * An inline script that the browser runs while parsing the HTML — before the
 * first paint and before React hydrates — so client-only state (a saved theme,
 * say) can be applied without a flash.
 *
 * On the client it renders as `text/plain` so React neither warns about a
 * rendered <script> nor runs the code a second time on a soft navigation;
 * `suppressHydrationWarning` covers that difference in `type`.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
