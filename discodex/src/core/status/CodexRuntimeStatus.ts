import type { ReasoningEffort } from "../model/ReasoningEffort.ts";

export type CodexRuntimeStatus = {
  model: string | null;
  reasoningEffort: string | null;
  reasoningSummaries: string | null;
  directory: string | null;
  permissions: string | null;
  agentsMd: string | null;
  accountEmail: string | null;
  accountPlan: string | null;
  collaborationMode: string | null;
  sessionId: string;
  contextWindow: {
    percentLeft: number | null;
    usedTokens: number | null;
    totalTokens: number | null;
  };
  fiveHourLimit: {
    percentLeft: number | null;
    resetsAtText: string | null;
  };
  weeklyLimit: {
    percentLeft: number | null;
    resetsAtText: string | null;
  };
};

export type CodexEffectiveModelConfig = {
  codexConversationId: string;
  currentModel: string | null;
  currentModelUnavailableReason: string | null;
  currentReasoningEffort: ReasoningEffort | null;
  currentReasoningEffortUnavailableReason: string | null;
  currentReasoningSummaries: string | null;
  currentReasoningSummariesUnavailableReason: string | null;
  modelOverride: string | null;
  reasoningEffortOverride: ReasoningEffort | null;
  selectableModels: string[];
  selectableEfforts: ReasoningEffort[];
};
