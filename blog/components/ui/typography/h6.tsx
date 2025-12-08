import type { ReactNode } from "react";

export function TypographyH6({ children }: { children: ReactNode }) {
  return (
    <h6 className="scroll-m-20 text-base font-semibold tracking-tight text-foreground mt-4 mb-2">
      {children}
    </h6>
  );
}
