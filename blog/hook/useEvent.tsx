import { isBrowser } from "es-toolkit";
import { useEffect, useLayoutEffect, useRef } from "react";

type EventHandler<T extends (...args: any[]) => any> = T;

const useIsomorphicLayoutEffect = isBrowser() ? useLayoutEffect : useEffect;

/**
 * 최신 콜백을 안정적으로 참조하기 위한 이벤트 훅.
 */
export function useEvent<T extends (...args: any[]) => any>(
  handler: EventHandler<T>,
): T {
  const handlerRef = useRef<EventHandler<T>>(handler);

  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });

  const stableHandler = ((...args: Parameters<T>): ReturnType<T> => {
    return handlerRef.current(...args);
  }) as T;

  return stableHandler;
}
