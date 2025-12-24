"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { isEmpty } from "es-toolkit/compat";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ArticleItem } from "@/components/article/article-item";
import { Input } from "@/components/ui/input";
import { useArticleSearch } from "@/hook/useArticleSearch";
import { useInputState } from "@/hook/useInputState";
import { useRangeIndexNavigator } from "@/hook/useIndexNavigator";
import { useKeyboardShortcuts } from "@/hook/useKeyboardShortcuts";
import type { ArticleMeta } from "@/lib/mdx/types";
import { Logo } from "./header/logo";
import type { OverlayControllerComponent } from "overlay-kit";
import { Repeat } from "@/lib/react/repeat";

type FeaturedArticlesProps = {
  articles: ArticleMeta[];
  activeIndex: number;
  shouldHighlight: boolean;
  onSelect: () => void;
};

const FeaturedArticlesSection = ({
  articles,
  activeIndex,
  shouldHighlight,
  onSelect,
}: FeaturedArticlesProps) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        추천 게시글
      </h2>
      <Repeat.Each each={articles} itemKey={(article) => article.slug}>
        {(article, index) => (
          <ArticleItem
            key={article.slug}
            article={article}
            variant="overlay"
            onSelect={onSelect}
            isActive={shouldHighlight && index === activeIndex}
          />
        )}
      </Repeat.Each>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="text-center text-muted-foreground py-12">
      검색 중입니다...
    </div>
  );
};

const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="text-center text-destructive py-12">
      <p className="text-lg font-medium mb-2">{message}</p>
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center text-muted-foreground py-12">
      <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
      <p className="text-sm">다른 검색어를 입력해 보세요</p>
    </div>
  );
};

type SearchResultsProps = {
  articles: ArticleMeta[];
  activeIndex: number;
  shouldEnableNavigation: boolean;
  onSelect: () => void;
};

const SearchResultsSection = ({
  articles,
  activeIndex,
  shouldEnableNavigation,
  onSelect,
}: SearchResultsProps) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {articles.length}개의 결과
      </p>
      <Repeat.Each each={articles} itemKey={(article) => article.slug}>
        {(article, index) => (
          <ArticleItem
            key={article.slug}
            article={article}
            variant="overlay"
            onSelect={onSelect}
            isActive={shouldEnableNavigation && index === activeIndex}
          />
        )}
      </Repeat.Each>
    </div>
  );
};

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

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    hasQuery,
    featuredArticles,
    articles,
    isLoading,
    error,
    resetSearchState,
  } = useArticleSearch({ isOpen, query });

  const showEmptyState = useMemo(() => {
    if (!hasQuery) return false;
    if (isLoading) return false;
    if (error) return false;
    return isEmpty(articles);
  }, [articles, error, hasQuery, isLoading]);

  const listToNavigate = useMemo(() => {
    if (!hasQuery) {
      return featuredArticles;
    }

    if (showEmptyState) {
      return featuredArticles;
    }

    return articles;
  }, [articles, featuredArticles, hasQuery, showEmptyState]);

  const {
    index: activeIndex,
    item: activeArticle,
    setIndex: setActiveIndex,
    goNext: goNextArticle,
    goPrev: goPrevArticle,
  } = useRangeIndexNavigator<ArticleMeta>({ items: listToNavigate });

  const shouldEnableNavigation = useMemo(
    () => !isEmpty(listToNavigate),
    [listToNavigate],
  );

  const handleClose = useCallback(() => {
    close();
    unmount();
  }, [close, unmount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!inputRef.current) {
      return;
    }

    inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    resetQuery();
    resetSearchState();
  }, [isOpen, resetQuery, resetSearchState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (listToNavigate.length === 0) {
      return;
    }

    setActiveIndex(0);
  }, [listToNavigate, setActiveIndex]);

  const handleNavigateToArticle = useCallback(() => {
    if (!shouldEnableNavigation) {
      return;
    }

    if (!activeArticle) {
      return;
    }

    router.push(`/articles/${activeArticle.slug}`);
    handleClose();
  }, [activeArticle, handleClose, router, shouldEnableNavigation]);

  useKeyboardShortcuts([{ keys: "Escape", handler: handleClose }], {
    enabled: isOpen,
  });

  useKeyboardShortcuts(
    [
      {
        keys: ["ArrowDown", "Down"],
        handler: () => {
          if (!shouldEnableNavigation) {
            return;
          }
          goNextArticle();
        },
        preventDefault: shouldEnableNavigation,
      },
      {
        keys: ["ArrowUp", "Up"],
        handler: () => {
          if (!shouldEnableNavigation) {
            return;
          }
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

  const renderContent = () => {
    if (error) {
      return <ErrorState message={error} />;
    }

    if (isLoading) {
      return <LoadingState />;
    }

    if (!hasQuery) {
      return (
        <FeaturedArticlesSection
          articles={featuredArticles}
          activeIndex={activeIndex}
          shouldHighlight={
            shouldEnableNavigation && listToNavigate === featuredArticles
          }
          onSelect={handleClose}
        />
      );
    }

    if (showEmptyState) {
      return (
        <>
          <EmptyState />
          <FeaturedArticlesSection
            articles={featuredArticles}
            activeIndex={activeIndex}
            shouldHighlight={
              shouldEnableNavigation && listToNavigate === featuredArticles
            }
            onSelect={handleClose}
          />
        </>
      );
    }

    return (
      <SearchResultsSection
        articles={articles}
        activeIndex={activeIndex}
        shouldEnableNavigation={shouldEnableNavigation}
        onSelect={handleClose}
      />
    );
  };

  if (!isOpen) {
    return null;
  }

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

        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
      </div>
    </div>
  );
};
