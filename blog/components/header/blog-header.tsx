"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { GithubButton } from "./github-button";
import { Logo } from "./logo";
import { Button } from "@jeongrae/ui";
import { overlay } from "overlay-kit";
import { SearchOverlay } from "../search-overlay";
import { useKeyboardShortcuts } from "@/hook/useKeyboardShortcuts";

export function BlogHeader() {
  const openSearch = useCallback(() => {
    overlay.open((props) => <SearchOverlay {...props} />);
  }, []);

  useKeyboardShortcuts([
    {
      keys: ["k", "K"],
      ctrl: true,
      handler: openSearch,
      preventDefault: true,
    },
  ]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={openSearch}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            검색
          </Button>
          <GithubButton />
        </div>
      </div>
    </header>
  );
}
