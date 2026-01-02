import { useCallback, useEffect, useRef } from "react";

export type EventHandler<TArgs extends any[] = any[], TResult = any> = (
  ...args: TArgs
) => TResult;

export function useEvent<TArgs extends any[], TResult>(
  handler: EventHandler<TArgs, TResult>,
): EventHandler<TArgs, TResult> {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return useCallback((...args: TArgs) => handlerRef.current(...args), []);
}
