import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";

import {
  TypographyBlockquote,
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyH5,
  TypographyH6,
  TypographyImage,
  TypographyInlineCode,
  TypographyLarge,
  TypographyLead,
  TypographyLink,
  TypographyList,
  TypographyMuted,
  TypographyOrderedList,
  TypographyP,
  TypographySmall,
  TypographyTable,
  TypographyTbody,
  TypographyTd,
  TypographyTh,
  TypographyThead,
  TypographyTr,
} from "@/components/ui/typography";

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => <TypographyH1 {...props} />,
  h2: (props: ComponentProps<"h2">) => <TypographyH2 {...props} />,
  h3: (props: ComponentProps<"h3">) => <TypographyH3 {...props} />,
  h4: (props: ComponentProps<"h4">) => <TypographyH4 {...props} />,
  h5: (props: ComponentProps<"h5">) => <TypographyH5 {...props} />,
  h6: (props: ComponentProps<"h6">) => <TypographyH6 {...props} />,
  p: (props: ComponentProps<"p">) => <TypographyP {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <TypographyBlockquote {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => <TypographyList {...props} />,
  ol: (props: ComponentProps<"ol">) => <TypographyOrderedList {...props} />,
  li: (props: ComponentProps<"li">) => <li {...props} />,
  table: (props: ComponentProps<"table">) => <TypographyTable {...props} />,
  thead: (props: ComponentProps<"thead">) => <TypographyThead {...props} />,
  tbody: (props: ComponentProps<"tbody">) => <TypographyTbody {...props} />,
  tr: (props: ComponentProps<"tr">) => <TypographyTr {...props} />,
  th: (props: ComponentProps<"th">) => <TypographyTh {...props} />,
  td: (props: ComponentProps<"td">) => <TypographyTd {...props} />,
  code: (props: ComponentProps<"code">) => <TypographyInlineCode {...props} />,
  a: (props: ComponentProps<"a">) => <TypographyLink {...props} />,
  img: (props: ComponentProps<"img">) => (
    <TypographyImage src={String(props.src ?? "")} alt={props.alt ?? ""} />
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
