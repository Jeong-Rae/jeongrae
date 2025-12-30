import { useCallback, useState } from "react";

/**
 * boolean 상태 객체
 */
type UseBooleanStateResult = {
  /** 현재 boolean 값 */
  value: boolean;
  /** 상태를 true로 설정 */
  setTrue: () => void;
  /** 상태를 false로 설정 */
  setFalse: () => void;
  /** 상태를 토글 */
  toggle: () => void;
};

/**
 * boolean 상태를 다루기 위한 간단한 훅.
 * @param initial - boolean 상태의 초기값 (기본값: false)
 * @returns boolean 상태 객체
 * @example
 * const { value, setTrue, setFalse, toggle } = useBooleanState(false);
 */
export function useBooleanState(
  initial: boolean = false,
): UseBooleanStateResult {
  const [value, setValue] = useState(initial);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return { value, setTrue, setFalse, toggle };
}
