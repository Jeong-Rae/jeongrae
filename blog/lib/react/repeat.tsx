import React from "react";

/**
 * @remarks
 * 현재 key 관리는 호출 측에서 수행한다.
 * 추후 `keySelector` 등 key 생성 전략을 내부에서 처리하는 기능을 추가할 수 있다.
 */

/**
 * 반복 렌더링 컴포넌트
 * - `times` 로 지정한 횟수만큼 children을 렌더링
 *
 * @example
 * ```tsx
 * <Repeat.Times times={10}>
 *   {(index) => <Component key={index} />}
 * </Repeat.Times>
 * ```
 *
 */
export type RepeatTimesProps = {
  /** 반복 횟수
   * - 0이하인 경우 렌더링되지 않음 */
  times: number;
  children: (index: number) => React.ReactNode;
};

export function RepeatTimes({ times = 0, children }: RepeatTimesProps) {
  if (times <= 0) return null;

  return <>{Array.from({ length: times }, (_, index) => children(index))}</>;
}

/**
 * 배열 반복 렌더링 컴포넌트
 * - `each` 로 전달된 배열을 순회하며 children 렌더링
 *
 * @typeParam T `each` 모드에서 순회하는 배열 요소 타입
 *
 * @example
 * ```tsx
 * const users = [{ id: "u1" }, { id: "u2" }];
 *
 * <Repeat.Each each={users}>
 *   {(user, index) => <Component key={user.id} user={user} />}
 * </Repeat.Each>
 * ```
 */
export type RepeatEachProps<T> = {
  /** 반복할 배열 */
  each: T[];
  children: (item: T, index: number) => React.ReactNode;
};

/** 배열 기반 반복 렌더링 */
export function RepeatEach<T>({ each = [], children }: RepeatEachProps<T>) {
  if (!each || each.length === 0) return null;

  return <>{each.map((item, index) => children(item, index))}</>;
}

/**
 *
 * - `Repeat.Times` : 정수 기반 반복
 * - `Repeat.Each`  : 배열 기반 반복
 */
export const Repeat = {
  Times: RepeatTimes,
  Each: RepeatEach,
} as const;
