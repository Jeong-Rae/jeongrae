import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@jeongrae/ui";
import { isString } from "es-toolkit";

export function MdxFigure({
  className,
  ...props
}: ComponentPropsWithoutRef<"figure">) {
  const isPrettyCodeFigure = isString(
    (props as { "data-rehype-pretty-code-figure"?: string })[
      "data-rehype-pretty-code-figure"
    ],
  );

  return (
    <figure
      className={cn(
        isPrettyCodeFigure &&
          "my-6 flex flex-col [&>pre]:my-0 [&>pre]:order-2 [&>[data-rehype-pretty-code-caption]]:order-1 [&>[data-rehype-pretty-code-title]]:order-0",
        className,
      )}
      {...props}
    />
  );
}
