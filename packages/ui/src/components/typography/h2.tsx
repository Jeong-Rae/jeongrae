import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function TypographyH2({
  children,
  withBorder = true,
}: {
  children: ReactNode;
  withBorder?: boolean;
}) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 text-foreground mt-10",
        withBorder && "border-b border-border pb-2",
      )}
    >
      {children}
    </h2>
  );
}
