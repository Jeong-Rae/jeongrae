import type { ComponentProps } from 'react';
import type { MDXComponents } from 'mdx/types'

export const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => (
    <h1 {...props}/>
  ),
  h2: (props: ComponentProps<'h2'>) => (
    <h2 {...props}/>
  ),
  p: (props: ComponentProps<"p">) => (
    <p {...props} className="text-[17px] leading-[1.8] text-[#4e5968] mb-6" />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      {...props}
      className="border-l-4 border-[#3182f6] pl-6 py-2 my-8 bg-transparent [&>p]:text-[17px] [&>p]:leading-[1.8] [&>p]:text-[#4e5968]"
    />
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  }
}