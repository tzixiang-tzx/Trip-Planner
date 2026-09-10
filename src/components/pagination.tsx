import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const hrefFor = (target: number) => (target <= 1 ? basePath : `${basePath}?page=${target}`);

  return (
    <nav className="flex items-center justify-center gap-3 pt-1" aria-label="Pagination">
      {hasPrev ? (
        <Link href={hrefFor(page - 1)} className="btn btn-ghost px-4 py-1.5 text-xs">
          ← Previous
        </Link>
      ) : (
        <span className="btn btn-ghost px-4 py-1.5 text-xs opacity-40">← Previous</span>
      )}

      <span className="label-xs">
        Page {page} of {totalPages}
      </span>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} className="btn btn-ghost px-4 py-1.5 text-xs">
          Next →
        </Link>
      ) : (
        <span className="btn btn-ghost px-4 py-1.5 text-xs opacity-40">Next →</span>
      )}
    </nav>
  );
}
