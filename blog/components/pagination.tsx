"use client";

import { ButtonLink } from "@/components/ui/button-link";
import { Repeat } from "@/lib/react/repeat";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const makeHref = (page: number) => (page === 1 ? "/" : `/?page=${page}`);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 pt-8 border-t border-border">
      <ButtonLink
        variant="outline"
        size="sm"
        disabled={!canGoPrev}
        href={canGoPrev ? makeHref(currentPage - 1) : undefined}
      >
        이전
      </ButtonLink>

      <Repeat.Times times={totalPages}>
        {(i) => {
          const pageNumber = i + 1;
          const isActive = currentPage === pageNumber;

          return (
            <ButtonLink
              key={pageNumber}
              href={makeHref(pageNumber)}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="min-w-[40px]"
            >
              {pageNumber}
            </ButtonLink>
          );
        }}
      </Repeat.Times>

      <ButtonLink
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        href={canGoNext ? makeHref(currentPage + 1) : undefined}
      >
        다음
      </ButtonLink>
    </div>
  );
}
