import type { ReactNode } from "react";

export function TypographyTd({ children }: { children: ReactNode }) {
  return (
    <td className="border border-border px-4 py-2 text-left text-muted-foreground [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  );
}
