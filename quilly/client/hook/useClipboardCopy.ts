import { useCallback } from "react";

export function useClipboardCopy() {
  const copy = useCallback(async (text: string) => {
    try {
      if (!navigator?.clipboard) return false;
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { copy };
}
