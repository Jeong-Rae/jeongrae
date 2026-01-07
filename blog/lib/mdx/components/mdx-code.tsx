import type { ComponentPropsWithoutRef } from "react";

import { TypographyInlineCode } from "@jeongrae/ui";
import { isString } from "es-toolkit";

export function MdxCode({
  className,
  ...props
}: ComponentPropsWithoutRef<"code">) {
  const dataLanguage = (props as { "data-language"?: string })["data-language"];
  const isBlockCode =
    className?.includes("language-") || isString(dataLanguage);

  if (isBlockCode) {
    return <code className={className} {...props} />;
  }

  return <TypographyInlineCode className={className} {...props} />;
}
