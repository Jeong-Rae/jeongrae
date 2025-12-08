import type { ReactNode } from "react";

export function TypographyTr({ children }: { children: ReactNode }) {
  return (
    <tr className="m-0 border-t border-border p-0 even:bg-muted">{children}</tr>
  );
}
