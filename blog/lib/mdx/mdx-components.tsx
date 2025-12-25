import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";

import { Image } from "@jeongrae/ui";
import {
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyH6,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyLink,
  TypographyList,
  TypographyMuted,
  TypographyOrderedList,
  TypographyP,
  TypographyPre,
  TypographySmall,
  TypographyTable,
  TypographyTbody,
  TypographyTd,
  TypographyTh,
  TypographyThead,
  TypographyTr,
} from "@jeongrae/ui";
import { Callout } from "@jeongrae/ui";

function MdxCode({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  const dataLanguage = (props as { "data-language"?: string })["data-language"];
  const isBlockCode =
    className?.includes("language-") || typeof dataLanguage === "string";

  if (isBlockCode) {
    return <code className={className} {...props} />;
  }

  return <TypographyInlineCode className={className} {...props} />;
}

export const mdxComponents: MDXComponents = {
  h1: (props) => <TypographyH1 {...props} withBorder={false} />,
  h2: (props) => <TypographyH2 {...props} withBorder={false} />,
  h3: TypographyH3,
  h4: TypographyH4,
  h5: TypographyH5,
  h6: TypographyH6,
  p: TypographyP,
  blockquote: TypographyBlockquote,
  ul: TypographyList,
  ol: TypographyOrderedList,
  li: (props) => <li {...props} />,
  table: TypographyTable,
  thead: TypographyThead,
  tbody: TypographyTbody,
  tr: TypographyTr,
  th: TypographyTh,
  td: TypographyTd,
  pre: TypographyPre,
  code: MdxCode,
  a: TypographyLink,
  Image: (props) => <Image {...props} wide="75" border />,
  Callout,
};
