import type { ReactNode } from "react";

export function TypographyH5({ children }: { children: ReactNode }) {
  return (
    <h5 className="scroll-m-20 text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h5>
  );
}
