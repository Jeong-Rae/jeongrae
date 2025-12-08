import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type PaginationProps = React.ComponentProps<"nav">;

type PaginationLinkProps = React.ComponentProps<typeof Link> & {
  isActive?: boolean;
  isDisabled?: boolean;
  size?: "default" | "sm";
};

export function Pagination({ className, ...props }: PaginationProps) {
  return (
    <nav
      aria-label="pagination"
      className={cn("flex w-full items-center justify-center", className)}
      role="navigation"
      {...props}
    />
  );
}

export const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

export const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

export function PaginationLink({
  className,
  isActive,
  isDisabled,
  size = "default",
  ...props
}: PaginationLinkProps) {
  const sizeClass =
    size === "sm"
      ? "h-8 min-w-[32px] px-3 text-xs"
      : "h-9 min-w-[36px] px-4 text-sm";

  return (
    <Link
      aria-disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        sizeClass,
        isActive &&
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      tabIndex={isDisabled ? -1 : undefined}
      {...props}
    />
  );
}

export function PaginationPrevious({
  className,
  children = (
    <>
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </>
  ),
  ...props
}: PaginationLinkProps & { children?: React.ReactNode }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("gap-1 pl-2.5 pr-3", className)}
      {...props}
    >
      {children}
    </PaginationLink>
  );
}

export function PaginationNext({
  className,
  children = (
    <>
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </>
  ),
  ...props
}: PaginationLinkProps & { children?: React.ReactNode }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("gap-1 pl-3 pr-2.5", className)}
      {...props}
    >
      {children}
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center",
        "rounded-md border border-transparent",
        className,
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
