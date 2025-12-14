import { promises as fs } from "node:fs";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { findArticleMetaBySlug } from "./articles";
import type { ArticleFrontmatter, Article } from "./types";
import { mdxComponents } from "./mdx-components";

export async function getCompiledArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const meta = findArticleMetaBySlug(slug);
  if (!meta) return null;

  const raw = await fs.readFile(meta.filePath, "utf8");

  const { content, frontmatter } = await compileMDX<ArticleFrontmatter>({
    source: raw,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkFrontmatter, remarkGfm],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: {
                dark: "github-dark",
                light: "github-light",
              },
              defaultLang: "plaintext",
            },
          ],
        ],
      },
    },
    components: mdxComponents,
  });

  const mergedFrontmatter: ArticleFrontmatter = {
    ...frontmatter,
  };

  return {
    meta: {
      ...meta,
      ...mergedFrontmatter,
    },
    content,
  };
}
