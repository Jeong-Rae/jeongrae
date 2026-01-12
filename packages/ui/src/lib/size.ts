export const uiSizes = ["xs", "sm", "md", "lg", "xl"] as const;

export type UISize = (typeof uiSizes)[number];

export const buttonSizeClasses: Record<UISize, string> = {
  xs: "h-7 px-2 text-xs has-[>svg]:px-1.5",
  sm: "h-8 px-3 text-sm has-[>svg]:px-2.5",
  md: "h-9 px-4 text-sm has-[>svg]:px-3",
  lg: "h-10 px-5 text-base has-[>svg]:px-4",
  xl: "h-11 px-6 text-base has-[>svg]:px-5",
};

export const inputSizeClasses: Record<UISize, string> = {
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
  xl: "h-11 px-4 text-base",
};

export const textareaSizeClasses: Record<UISize, string> = {
  xs: "min-h-12 px-2 py-1 text-xs",
  sm: "min-h-14 px-3 py-1.5 text-sm",
  md: "min-h-16 px-3 py-2 text-sm",
  lg: "min-h-20 px-4 py-2 text-base",
  xl: "min-h-24 px-4 py-3 text-base",
};

export const selectTriggerSizeClasses: Record<UISize, string> = {
  xs: "h-7 text-xs",
  sm: "h-8 text-sm",
  md: "h-9 text-sm",
  lg: "h-10 text-base",
  xl: "h-11 text-base",
};
