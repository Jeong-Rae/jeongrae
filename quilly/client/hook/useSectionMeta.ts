import { useMemo } from "react";

import type { Section } from "@/lib/types";
import { isEmpty } from "es-toolkit/compat";

type SectionMeta = {
  missingInfo: string[];
  agentQuestion?: string;
  previousSummary?: string;
};

export function useSectionMeta(
  currentSection?: Section,
  previousSection?: Section,
): SectionMeta {
  return useMemo(() => {
    const missingInfo = (() => {
      if (!currentSection || isEmpty(currentSection?.notes)) {
        return currentSection?.requiredInfo ?? [];
      }
      if (currentSection.status === "insufficient") {
        return currentSection.requiredInfo.slice(currentSection.notes.length);
      }
      return [];
    })();

    const agentQuestion = (() => {
      if (!currentSection) return undefined;
      if (currentSection.notes.length === 0 && currentSection.requiredInfo[0]) {
        return `이 섹션에서 ${currentSection.requiredInfo[0]}에 대해 알려주세요.`;
      }
      if (currentSection.status === "insufficient" && missingInfo.length > 0) {
        return `${missingInfo[0]}에 대한 정보가 더 필요합니다.`;
      }
      return undefined;
    })();

    const previousSummary = (() => {
      if (!previousSection || previousSection.notes.length === 0)
        return undefined;
      return `${previousSection.title}: ${previousSection.notes
        .map((note) => note.content)
        .join(" ")
        .slice(0, 100)}...`;
    })();

    return { missingInfo, agentQuestion, previousSummary };
  }, [currentSection, previousSection]);
}
