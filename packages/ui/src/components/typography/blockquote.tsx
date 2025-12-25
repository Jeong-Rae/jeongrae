import type { ReactNode } from "react";

export function TypographyBlockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
      {children}
    </blockquote>
  );
}
