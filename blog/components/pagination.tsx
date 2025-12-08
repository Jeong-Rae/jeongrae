"use client";

import {
  Pagination as PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
    <PaginationRoot className="mt-8 items-center justify-center border-t border-border pt-8">
      <PaginationContent className="flex-wrap justify-center gap-2">
        <PaginationItem>
          <PaginationPrevious
            href={canGoPrev ? makeHref(currentPage - 1) : "#"}
            isDisabled={!canGoPrev}
          >
            이전
          </PaginationPrevious>
        </PaginationItem>

        <Repeat.Times times={totalPages}>
          {(i) => {
            const pageNumber = i + 1;
            const isActive = currentPage === pageNumber;

            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href={makeHref(pageNumber)}
                  isActive={isActive}
                  size="sm"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          }}
        </Repeat.Times>

        <PaginationItem>
          <PaginationNext
            href={canGoNext ? makeHref(currentPage + 1) : "#"}
            isDisabled={!canGoNext}
          >
            다음
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
