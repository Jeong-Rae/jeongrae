import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TypographyH1({
  children,
  withBorder = false,
}: {
  children: ReactNode;
  withBorder?: boolean;
}) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mt-12 mb-6",
        withBorder && "border-b border-border pb-4",
      )}
    >
      {children}
    </h1>
  );
}
