"use client";

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
  search?: string;
  language?: string;
  sort?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  search,
  language,
  sort,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function buildUrl(page: number) {
    const params = new URLSearchParams();

    params.set("page", String(page));

    if (search) params.set("search", search);
    if (language) params.set("language", language);
    if (sort && sort !== "recent") params.set("sort", sort);

    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          aria-label="Page precedente"
          className="flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm text-slate-700 transition hover:bg-slate-100"
          href={buildUrl(currentPage - 1)}
        >
          Precedente
        </Link>
      ) : null}

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1;

          return (
            <Link
              aria-label={`Page ${page}`}
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-md text-sm transition ${
                page === currentPage
                  ? "bg-slate-950 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
              href={buildUrl(page)}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          aria-label="Page suivante"
          className="flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm text-slate-700 transition hover:bg-slate-100"
          href={buildUrl(currentPage + 1)}
        >
          Suivante
        </Link>
      ) : null}
    </div>
  );
}
