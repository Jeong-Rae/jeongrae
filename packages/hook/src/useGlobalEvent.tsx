import { isBrowser } from "es-toolkit";
import { type RefObject, useEffect } from "react";

import { useEvent } from "./useEvent";

export type GlobalEventTarget =
  | Window
  | Document
  | HTMLElement
  | RefObject<HTMLElement | Document | Window | null>
  | null
  | undefined;

type UseGlobalEventParams<K extends keyof DocumentEventMap> = {
  type: K;
  handler: (event: DocumentEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
  target?: GlobalEventTarget;
  enabled?: boolean;
};

export function useGlobalEvent<K extends keyof DocumentEventMap>({
  type,
  handler,
  options,
  target,
  enabled = true,
}: UseGlobalEventParams<K>) {
  const stableHandler = useEvent(handler);

  useEffect(() => {
    const resolvedTarget = (() => {
      if (target === undefined) return isBrowser() ? window : undefined;
      if (!target) return undefined;
      if ("current" in target) return target.current ?? undefined;
      return target;
    })();

    if (!enabled || !resolvedTarget?.addEventListener) return undefined;

    resolvedTarget.addEventListener(
      type,
      stableHandler as EventListener,
      options,
    );

    return () => {
      resolvedTarget.removeEventListener(
        type,
        stableHandler as EventListener,
        options,
      );
    };
  }, [enabled, options, stableHandler, target, type]);
}
