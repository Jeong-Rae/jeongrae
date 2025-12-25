import type { ReactNode } from "react";

export function TypographyTh({ children }: { children: ReactNode }) {
  return (
    <th className="border border-border px-4 py-2 text-left font-bold text-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  );
}
