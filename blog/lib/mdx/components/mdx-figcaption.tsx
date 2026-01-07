import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@jeongrae/ui";
import { isString } from "es-toolkit";

export function MdxFigcaption({
  className,
  ...props
}: ComponentPropsWithoutRef<"figcaption">) {
  const isPrettyCodeCaption = isString(
    (props as { "data-rehype-pretty-code-caption"?: string })[
      "data-rehype-pretty-code-caption"
    ],
  );

  return (
    <figcaption
      className={cn(
        isPrettyCodeCaption && "mb-2 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
