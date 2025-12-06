import type { ComponentProps } from "react";
import type { MDXComponents } from "mdx/types";

import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
  TypographyP,
  TypographyBlockquote,
  TypographyList,
  TypographyLead,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
} from "@/components/ui/typography";

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => <TypographyH1 {...props} />,
  h2: (props: ComponentProps<"h2">) => <TypographyH2 {...props} />,
  h3: (props: ComponentProps<"h3">) => <TypographyH3 {...props} />,
  h4: (props: ComponentProps<"h4">) => <TypographyH4 {...props} />,
  p: (props: ComponentProps<"p">) => <TypographyP {...props} />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <TypographyBlockquote {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => <TypographyList {...props} />,
  li: (props: ComponentProps<"li">) => <li {...props} />,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...mdxComponents,
    ...components,
  };
}
