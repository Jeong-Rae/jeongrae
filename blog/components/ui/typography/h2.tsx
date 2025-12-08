import type { ReactNode } from "react";

export function TypographyH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-foreground">
      {children}
    </h2>
  );
}
