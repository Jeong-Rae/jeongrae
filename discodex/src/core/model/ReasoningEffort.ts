export const REASONING_EFFORT_VALUES = ["minimal", "low", "medium", "high", "xhigh"] as const;

export type ReasoningEffort = typeof REASONING_EFFORT_VALUES[number];

export function isReasoningEffort(value: string): value is ReasoningEffort {
  return (REASONING_EFFORT_VALUES as readonly string[]).includes(value);
}
