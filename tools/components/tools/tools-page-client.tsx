"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToolsHeader } from "@/components/tools/tools-header";
import { StatusFilter } from "@/components/tools/status-filter";
import { ToolsGrid } from "@/components/tools/tools-grid";
import type { Tool, ToolStatus } from "@/components/tools/tool-card";

type FilterStatus = ToolStatus | "all";

interface ToolsPageClientProps {
  tools: Tool[];
}

export function ToolsPageClient({ tools }: ToolsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilter = (searchParams.get("status") as FilterStatus) || "all";
  const [filter, setFilter] = useState<FilterStatus>(initialFilter);

  const handleFilterChange = (status: FilterStatus) => {
    setFilter(status);
    const params = new URLSearchParams();
    if (status !== "all") {
      params.set("status", status);
    }
    router.push(params.toString() ? `?${params.toString()}` : "/", {
      scroll: false,
    });
  };

  const filteredTools = useMemo(() => {
    if (filter === "all") return tools;
    return tools.filter((tool) => tool.status === filter);
  }, [filter, tools]);

  const counts = useMemo(
    () => ({
      all: tools.length,
      public: tools.filter((tool) => tool.status === "public").length,
      internal: tools.filter((tool) => tool.status === "internal").length,
      blocked: tools.filter((tool) => tool.status === "blocked").length,
    }),
    [tools],
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ToolsHeader />

        <div className="mb-6">
          <StatusFilter
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            counts={counts}
          />
        </div>

        <ToolsGrid tools={filteredTools} />
      </div>
    </main>
  );
}
