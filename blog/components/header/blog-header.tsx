import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "../ui/button-link";

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-bold text-primary-foreground text-lg">T</span>
          </div>
          <span className="font-bold text-xl">TechBlog</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ButtonLink
            href="https://github.com/Jeong-Rae"
            size="sm"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#24292e] hover:bg-[#1f2428] text-white"
          >
            <Image
              src="/github-mark-white.svg"
              alt="GitHub"
              width={16}
              height={16}
            />
            <Image
              src="/github-logo-white.png"
              alt="GitHub"
              width={16}
              height={32}
            />
          </ButtonLink>

          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">검색</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
