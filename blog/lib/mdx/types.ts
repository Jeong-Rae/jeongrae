import type { ReactElement } from "react";

/**
 * .mdx 파일의 frontmatter 정보
 */
export type ArticleFrontmatter = {
  title: string;
  summary: string;
  uploadAt: string;
  author?: string;
  thumbnail?: string;
  tags?: string[];
};

/**
 * frontmatter + 컴파일 과정에서 추가된 정보
 * 목록, 상세 페이지 메타데이터 표시에 사용
 */
export type ArticleMeta = ArticleFrontmatter & {
  slug: string;
  filePath: string;
};

/**
 * ArticleMeta + 실제 컴파일된 content
 * 상세 페이지에서 Article 콘텐츠를 렌더링할 때 사용
 */
export type Article = {
  meta: ArticleMeta;
  content: ReactElement;
};
