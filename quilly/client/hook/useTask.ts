import { useCallback, useEffect, useRef, useState } from "react";

import { useEvent } from "./useEvent";

export type TaskStatus = "idle" | "running" | "success" | "error";

export type UseTaskMode = "first-only" | "last-wins";

export type UseTaskOptions<TResult> = {
  mode?: UseTaskMode;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
  onSettled?: (info: {
    status: Exclude<TaskStatus, "idle">;
    result: TResult | null;
    error: unknown | null;
  }) => void;
};

export type UseTaskResult<TArgs extends any[], TResult> = {
  run: (...args: TArgs) => Promise<TResult | undefined>;

  status: TaskStatus;
  result: TResult | null;
  error: unknown | null;
  isRunning: boolean;

  reset: () => void;
};

const noop = () => {};

export function useTask<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => Promise<TResult> | TResult,
  options: UseTaskOptions<TResult> = {},
): UseTaskResult<TArgs, TResult> {
  const { mode = "last-wins", onSuccess, onError, onSettled } = options;
  const stableCallback = useEvent(callback);
  const stableOnSuccess = useEvent(onSuccess ?? noop);
  const stableOnError = useEvent(onError ?? noop);
  const stableOnSettled = useEvent(onSettled ?? noop);

  const [status, setStatus] = useState<TaskStatus>("idle");
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  const statusRef = useRef(status);
  const runIdRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const run = useCallback(
    async (...args: TArgs) => {
      if (mode === "first-only" && statusRef.current === "running") {
        return undefined;
      }

      const runId = ++runIdRef.current;
      setStatus("running");
      setError(null);
      setResult(null);

      try {
        const value = await stableCallback(...args);
        const isLatest = mode !== "last-wins" || runId === runIdRef.current;
        if (!isLatest) return undefined;

        setResult(value);
        setStatus("success");
        stableOnSuccess(value);
        stableOnSettled({ status: "success", result: value, error: null });
        return value;
      } catch (caught) {
        const isLatest = mode !== "last-wins" || runId === runIdRef.current;
        if (!isLatest) return undefined;

        setError(caught);
        setStatus("error");
        stableOnError(caught);
        stableOnSettled({ status: "error", result: null, error: caught });
        return undefined;
      }
    },
    [mode, stableCallback, stableOnError, stableOnSettled, stableOnSuccess],
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    run,
    status,
    result,
    error,
    isRunning: status === "running",
    reset,
  };
}
