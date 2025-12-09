import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { GithubButton } from "./github-button";
import { Logo } from "./logo";

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <GithubButton />
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">검색</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
