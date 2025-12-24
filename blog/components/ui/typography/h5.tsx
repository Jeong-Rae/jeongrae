import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TypographyH5({
  children,
  className,
}: { children: ReactNode; className?: string }) {
  return (
    <h5
      className={cn(
        "scroll-m-20 text-lg font-semibold tracking-tight text-foreground mt-4 mb-2",
        className,
      )}
    >
      {children}
    </h5>
  );
}
