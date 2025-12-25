import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/utils";

type TypographyInlineCodeProps = ComponentPropsWithoutRef<"code">;

export function TypographyInlineCode({
  className,
  ...props
}: TypographyInlineCodeProps) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className,
      )}
      {...props}
    />
  );
}
