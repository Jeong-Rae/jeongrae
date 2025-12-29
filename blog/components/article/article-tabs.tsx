"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@jeongrae/ui";

import { Repeat } from "@/lib/react/repeat";

const tabs = ["All", "Backend", "Frontend"] as const;
type ArticleTab = (typeof tabs)[number];
const tabList: ArticleTab[] = [...tabs];

const isArticleTab = (value: string): value is ArticleTab =>
  (tabs as readonly string[]).includes(value);

export function ArticleTabs() {
  const [activeTab, setActiveTab] = useState<ArticleTab>(tabs[0]);

  const handleValueChange = (value: string) => {
    if (isArticleTab(value)) {
      setActiveTab(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange}>
      <TabsList className="flex h-auto w-full items-end justify-start gap-3 border-b border-border bg-transparent p-0 text-muted-foreground">
        <Repeat.Each each={tabList}>
          {(tab) => (
            <TabsTrigger
              value={tab}
              className="-mb-px flex-none rounded-none border-b-2 border-transparent px-4 py-4 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-w-[96px] max-w-[160px] data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {tab}
            </TabsTrigger>
          )}
        </Repeat.Each>
      </TabsList>
    </Tabs>
  );
}
