import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type TypographyPreProps = ComponentPropsWithoutRef<"pre">;

export function TypographyPre({ className, ...props }: TypographyPreProps) {
  return (
    <pre
      className={cn(
        "my-6 overflow-x-auto rounded-lg border border-border p-4 font-mono text-sm leading-6",
        className,
      )}
      {...props}
    />
  );
}
