"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ArticleItem } from "@/components/article/article-item";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/lib/mdx/types";
import { useBooleanState } from "@/hook/useBooleanState";
import { useInputState } from "@/hook/useInputState";
import { useRangeIndexNavigator } from "@/hook/useIndexNavigator";
import { useKeyboardShortcuts } from "@/hook/useKeyboardShortcuts";
import { Logo } from "./header/logo";
import { OverlayControllerComponent } from "overlay-kit";

function PopularArticleItem({ article }: { article: ArticleMeta }) {
  const { slug, title } = article;
  return (
    <Link
      href={`/articles/${slug}`}
      className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
    >
      <p className="text-sm text-muted-foreground">{""}</p>
      <p className="font-medium text-foreground">{title}</p>
    </Link>
  );
}

export const SearchOverlay: OverlayControllerComponent = ({
  isOpen,
  close,
  unmount,
}) => {
  const router = useRouter();
  const {
    value: query,
    onChange: handleQueryChange,
    reset: resetQuery,
  } = useInputState("");
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const {
    value: isLoading,
    setTrue: startLoading,
    setFalse: stopLoading,
  } = useBooleanState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const hasQuery = useMemo(() => query.trim().length > 0, [query]);
  const {
    index: activeIndex,
    item: activeArticle,
    setIndex: setActiveIndex,
    goNext: goNextArticle,
    goPrev: goPrevArticle,
  } = useRangeIndexNavigator<ArticleMeta>({ items: articles });

  const shouldEnableNavigation = useMemo(
    () => hasQuery && articles.length > 0,
    [articles.length, hasQuery],
  );

  const handleClose = useCallback(() => {
    close();
    unmount();
  }, [close, unmount]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleNavigateToArticle = useCallback(() => {
    if (!shouldEnableNavigation || !activeArticle) return;
    router.push(`/articles/${activeArticle.slug}`);
    handleClose();
  }, [activeArticle, handleClose, router, shouldEnableNavigation]);

  useKeyboardShortcuts(
    [
      {
        keys: "Escape",
        handler: handleClose,
      },
    ],
    {
      enabled: isOpen,
    },
  );

  useKeyboardShortcuts(
    [
      {
        keys: ["ArrowDown", "Down"],
        handler: () => {
          if (!shouldEnableNavigation) return;
          goNextArticle();
        },
        preventDefault: shouldEnableNavigation,
      },
      {
        keys: ["ArrowUp", "Up"],
        handler: () => {
          if (!shouldEnableNavigation) return;
          goPrevArticle();
        },
        preventDefault: shouldEnableNavigation,
      },
      {
        keys: "Enter",
        handler: handleNavigateToArticle,
        preventDefault: shouldEnableNavigation,
      },
    ],
    {
      enabled: isOpen,
      target: inputRef.current || undefined,
    },
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetQuery();
      setArticles([]);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    const delay = setTimeout(() => {
      startLoading();
      fetch(`/api/search?query=${encodeURIComponent(query)}`, {
        method: "GET",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("검색 요청에 실패했습니다.");
          }
          const payload = (await response.json()) as {
            articles?: ArticleMeta[];
          };
          setArticles(payload.articles ?? []);
          setError(null);
        })
        .catch((fetchError: unknown) => {
          if ((fetchError as Error).name === "AbortError") return;
          setError("검색 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
          setArticles([]);
        })
        .finally(() => stopLoading());
    }, 200);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [isOpen, query, resetQuery, startLoading, stopLoading]);

  useEffect(() => {
    if (!hasQuery) return;
    if (articles.length === 0) return;
    setActiveIndex(0);
  }, [articles.length, hasQuery, setActiveIndex]);

  const showEmptyState =
    hasQuery && !isLoading && articles.length === 0 && !error;

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-background backdrop-blur-sm"
    >
      <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="검색 닫기"
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="검색어를 입력하세요"
            value={query}
            onChange={handleQueryChange}
            className="w-full h-14 pl-12 pr-4 text-lg border-2 border-border rounded-xl focus:border-primary"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="text-center text-destructive py-12">
              <p className="text-lg font-medium mb-2">{error}</p>
            </div>
          ) : isLoading && articles.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              검색 중입니다...
            </div>
          ) : !hasQuery ? (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                인기 게시글
              </h2>
              <div className="space-y-1">
                {articles.map((article) => (
                  <PopularArticleItem key={article.slug} article={article} />
                ))}
              </div>
            </div>
          ) : showEmptyState ? (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
              <p className="text-sm">다른 검색어를 입력해 보세요</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                {articles.length}개의 결과
              </p>
              <div className="space-y-1">
                {articles.map((article, index) => (
                  <ArticleItem
                    key={article.slug}
                    article={article}
                    variant="overlay"
                    onSelect={handleClose}
                    active={shouldEnableNavigation && index === activeIndex}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
