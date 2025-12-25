import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

export function TypographyH6({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h6
      className={cn(
        "scroll-m-20 text-base font-semibold tracking-tight text-foreground mt-4 mb-2",
        className,
      )}
    >
      {children}
    </h6>
  );
}
