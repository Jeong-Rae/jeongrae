import { useCallback, useEffect, useMemo, useState } from "react";
import { modulo, clamp } from "@lyght/ts";
import { isArray, isNumber, isFunction } from "es-toolkit/compat";

type IndexNavigatorMode = "range" | "circle";

type UseIndexNavigatorParamsFromArray<T> = {
  items: T[];
  initialIndex?: number;
  mode?: IndexNavigatorMode;
  length?: never;
};

type UseIndexNavigatorParamsFromLength = {
  length: number;
  initialIndex?: number;
  mode?: IndexNavigatorMode;
  items?: never;
};

type UseIndexNavigatorParams<T> =
  | UseIndexNavigatorParamsFromArray<T>
  | UseIndexNavigatorParamsFromLength;

function getNavigatorLength<T>(params: UseIndexNavigatorParams<T>): number {
  if (isArray(params.items)) {
    return params.items.length;
  }
  if (isNumber(params.length)) {
    return Math.max(0, params.length);
  }

  return 0;
}

export function useIndexNavigator<T>(params: UseIndexNavigatorParams<T>) {
  const { mode = "range", initialIndex = 0 } = params;

  const length = getNavigatorLength(params);
  const isCircleMode = mode === "circle";

  const clampIndex = useCallback((raw: number): number => {
    if (length <= 0) return 0;

    if (isCircleMode) {
      const value = modulo(raw, length);
      return value as number;
    }

    return clamp(raw, 0, length - 1);
  }, [length, isCircleMode]);

  const [index, setIndexState] = useState(() => clampIndex(initialIndex));

  useEffect(() => {
    setIndexState((prev) => clampIndex(prev));
  }, [length, mode]);

  const canMove = length > 1;

  const canGoNext = useMemo(() => {
    if (!canMove) return false;
    if (isCircleMode) return true;
    return index < length - 1;
  }, [canMove, mode, index, length]);

  const canGoPrev = useMemo(() => {
    if (!canMove) return false;
    if (isCircleMode) return true;
    return index > 0;
  }, [canMove, mode, index]);

  const setIndex = useCallback((next: number | ((prev: number) => number)) => {
    setIndexState((prev) => {
      const target = isFunction(next) ? next(prev) : next;
      return clampIndex(target);
    });
  }, [clampIndex]);

  const goNext = useCallback(() => {
    if (canGoNext) setIndex((p) => p + 1);
  }, [canGoNext, setIndex]);

  const goPrev = useCallback(() => {
    if (canGoPrev) setIndex((p) => p - 1);
  }, [canGoPrev, setIndex]);

  const reset = useCallback(() => {
    setIndex(initialIndex);
  }, [setIndex, initialIndex]);

  const item = useMemo(() => {
    const maybeItems = params.items;
    if (!isArray(maybeItems)) return null;
    if (length <= 0) return null;
    return maybeItems[index] ?? null;
  }, [params, index, length]);

  return {
    index,
    item,
    length,
    goNext,
    goPrev,
    setIndex,
    reset,
    canGoNext,
    canGoPrev,
  };
}

export function useRangeIndexNavigator<T>(
  params: Omit<UseIndexNavigatorParams<T>, "mode">,
) {
  return useIndexNavigator<T>({ ...(params as any), mode: "range" });
}

export function useCircleIndexNavigator<T>(
  params: Omit<UseIndexNavigatorParams<T>, "mode">,
) {
  return useIndexNavigator<T>({ ...(params as any), mode: "circle" });
}
