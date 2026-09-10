/** Money is stored as whole minor units everywhere — no float drift in the split maths. */

/** Currencies with no subdivision: ¥1000 is 1000 minor units, not 100000. */
const ZERO_DECIMAL = new Set([
  "JPY", "KRW", "VND", "CLP", "ISK", "XAF", "XOF", "XPF", "KMF", "DJF", "GNF", "PYG", "RWF", "UGX", "VUV",
]);

export const CURRENCIES = [
  { code: "SGD", label: "Singapore dollar" },
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "Pound sterling" },
  { code: "JPY", label: "Japanese yen" },
  { code: "AUD", label: "Australian dollar" },
  { code: "NZD", label: "New Zealand dollar" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "CHF", label: "Swiss franc" },
  { code: "MYR", label: "Malaysian ringgit" },
  { code: "THB", label: "Thai baht" },
  { code: "IDR", label: "Indonesian rupiah" },
  { code: "PHP", label: "Philippine peso" },
  { code: "VND", label: "Vietnamese dong" },
  { code: "KRW", label: "South Korean won" },
  { code: "INR", label: "Indian rupee" },
  { code: "HKD", label: "Hong Kong dollar" },
  { code: "TWD", label: "New Taiwan dollar" },
  { code: "CNY", label: "Chinese yuan" },
  { code: "AED", label: "UAE dirham" },
  { code: "ZAR", label: "South African rand" },
] as const;

/** How many minor units make one unit of this currency. */
export function minorUnitsPer(currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? 1 : 100;
}

export function toMinorUnits(input: string | number, currency = "SGD"): number {
  const value = typeof input === "number" ? input : Number.parseFloat(input.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * minorUnitsPer(currency));
}

export function formatMoney(minor: number, currency = "SGD"): string {
  const amount = minor / minorUnitsPer(currency);
  try {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Split `total` across `count` people without losing or inventing a unit:
 * the remainder is handed out one at a time to the first few people.
 */
export function splitEvenly(total: number, count: number): number[] {
  if (count <= 0) return [];
  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(total);
  const base = Math.floor(abs / count);
  const remainder = abs - base * count;
  return Array.from({ length: count }, (_, i) => sign * (base + (i < remainder ? 1 : 0)));
}
