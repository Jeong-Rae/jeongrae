import { useCallback } from "react";
import { useBooleanState } from "@jeongrae/hook";

export function useAsyncAction() {
  const { value: isLoading, setTrue, setFalse } = useBooleanState(false);

  const run = useCallback(
    async (task: () => Promise<void>) => {
      setTrue();
      try {
        await task();
      } finally {
        setFalse();
      }
    },
    [setTrue, setFalse],
  );

  return { isLoading, run };
}
