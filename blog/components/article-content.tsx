import type { ReactNode } from "react";

export function ArticleContent({ children }: { children: ReactNode }) {
return (
    <div className="prose prose-lg max-w-none text-foreground">
      {children}
    </div>
  );
}