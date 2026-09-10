export const PAGE_SIZE = 20;

/** Parses a `?page=` search param into a positive integer, defaulting to 1 for anything invalid. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Keeps a requested page within [1, totalPages] so a stale or out-of-range page never renders as empty. */
export function clampPage(requested: number, total: number, pageSize = PAGE_SIZE): number {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(requested, totalPages);
}

export function totalPagesFor(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function skipFor(page: number, pageSize = PAGE_SIZE): number {
  return (page - 1) * pageSize;
}
