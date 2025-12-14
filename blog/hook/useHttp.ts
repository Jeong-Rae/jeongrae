import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { HttpClient } from "@/lib/http/http";

export type UseHttpState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
};

export type UseHttpOptions = {
  enabled?: boolean;
  keepPreviousData?: boolean;
  onError?: (error: Error) => void;
};

export type UseHttpParams<TResponse> = {
  client: HttpClient;
  request: (signal: AbortSignal) => Promise<TResponse>;
  deps?: ReadonlyArray<unknown>;
  options?: UseHttpOptions;
};

export const useHttp = <TResponse>(params: UseHttpParams<TResponse>) => {
  const { request, deps = [], options } = params;

  const savedRequest = useRef(request);
  useEffect(() => {
    savedRequest.current = request;
  }, [request]);

  const savedOptions = useRef(options);
  useEffect(() => {
    savedOptions.current = options;
  }, [options]);

  const enabled = options?.enabled ?? true;
  const keepPreviousData = options?.keepPreviousData ?? false;

  const [state, setState] = useState<UseHttpState<TResponse>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const controllerRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const execute = useCallback(async () => {
    abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    setState((prev) => ({
      data: keepPreviousData ? prev.data : null,
      error: null,
      isLoading: true,
    }));

    try {
      const data = await savedRequest.current(controller.signal);
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (e) {
      const error = e as Error;

      if (error.name === "AbortError") {
        setState((prev) => ({ ...prev, isLoading: false }));
        return null;
      }

      setState((prev) => ({
        data: keepPreviousData ? prev.data : null,
        error,
        isLoading: false,
      }));

      savedOptions.current?.onError?.(error);
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abort, keepPreviousData, ...deps]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void execute();

    return () => abort();
  }, [abort, enabled, execute]);

  return useMemo(
    () => ({
      ...state,
      execute,
      abort,
      setData: (updater: (prev: TResponse | null) => TResponse | null) => {
        setState((prev) => ({ ...prev, data: updater(prev.data) }));
      },
    }),
    [abort, execute, state],
  );
};
