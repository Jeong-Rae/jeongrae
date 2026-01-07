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
  TypographyLink,
  TypographyList,
  TypographyOrderedList,
  TypographyP,
  TypographyPre,
  TypographyTable,
  TypographyTbody,
  TypographyTd,
  TypographyTh,
  TypographyThead,
  TypographyTr,
} from "@jeongrae/ui";
import { Callout } from "@jeongrae/ui";

import { MdxCode } from "./components/mdx-code";
import { MdxFigcaption } from "./components/mdx-figcaption";
import { MdxFigure } from "./components/mdx-figure";

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
  figure: MdxFigure,
  figcaption: MdxFigcaption,
  pre: TypographyPre,
  code: MdxCode,
  a: TypographyLink,
  Image: (props) => <Image {...props} wide="75" border />,
  Callout,
};
