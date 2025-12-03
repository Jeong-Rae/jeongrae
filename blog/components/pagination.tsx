"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <Button asChild variant="outline" size="sm" disabled={!canGoPrev}>
        <Link href={canGoPrev ? makeHref(currentPage - 1) : "#"}>이전</Link>
      </Button>

      <Repeat.Times times={totalPages}>
        {(i) => {
          const pageNumber = i + 1;
          const isActive = currentPage === pageNumber;

          return (
            <Button
              key={pageNumber}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="min-w-[40px]"
            >
              <Link href={makeHref(pageNumber)}>{pageNumber}</Link>
            </Button>
          );
        }}
      </Repeat.Times>

      <Button asChild variant="outline" size="sm" disabled={!canGoNext}>
        <Link href={canGoNext ? makeHref(currentPage + 1) : "#"}>다음</Link>
      </Button>
    </div>
  );
}
