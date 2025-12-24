import { useEffect, useMemo, useState } from "react";
import { debounce } from "es-toolkit/function";

import { useHttp } from "@/hook/useHttp";
import { http } from "@/lib/http/http";
import type { ArticleMeta } from "@/lib/mdx/types";

type SearchPayload = { articles?: ArticleMeta[] };

export type UseArticleSearchParams = { isOpen: boolean; query: string };

export const useArticleSearch = (params: UseArticleSearchParams) => {
  const { isOpen, query } = params;

  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const hasQuery = normalizedQuery.length > 0;

  const [debouncedQuery, setDebouncedQuery] = useState(normalizedQuery);

  const debouncedUpdater = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedQuery(value);
      }, 200),
    [],
  );

  useEffect(() => {
    debouncedUpdater(normalizedQuery);
    return () => debouncedUpdater.cancel();
  }, [debouncedUpdater, normalizedQuery]);

  const featured = useHttp<SearchPayload>({
    client: http,
    deps: [isOpen],
    options: { enabled: isOpen, keepPreviousData: true },
    request: (signal) =>
      http.get<SearchPayload>("/api/search", {
        query: { query: "" },
        signal,
      }),
  });

  const search = useHttp<SearchPayload>({
    client: http,
    deps: [isOpen, debouncedQuery],
    options: {
      enabled: isOpen && debouncedQuery.length > 0,
      keepPreviousData: false,
    },
    request: (signal) =>
      http.get<SearchPayload>("/api/search", {
        query: { query: debouncedQuery },
        signal,
      }),
  });

  const featuredArticles = featured.data?.articles ?? [];
  const articles = search.data?.articles ?? [];

  const error = useMemo(() => {
    if (!search.error) return null;
    return "검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }, [search.error]);

  const isLoading = search.isLoading;

  const resetSearchState = () => {
    featured.abort();
    search.abort();
  };

  return {
    hasQuery,
    featuredArticles,
    articles,
    isLoading,
    error,
    resetSearchState,
  };
};
