import type { ReactNode } from "react";

export function TypographyOrderedList({ children }: { children: ReactNode }) {
  return (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground">
      {children}
    </ol>
  );
}
