import { isString } from "es-toolkit";
import { hasIn, isNumber, isObject } from "es-toolkit/compat";
import { cloneElement, Fragment, isValidElement, Key, ReactNode } from "react";

function resolveKey<T>(
  item: T,
  index: number,
  itemKey?: (item: T, index: number) => Key,
): Key {
  if (itemKey) return itemKey(item, index);

  if (isObject(item) && hasIn(item, "id")) {
    const id = (item as any).id;
    if (isString(id) || isNumber(id)) {
      return id;
    }
  }

  return index;
}

function applyIndexProp(
  node: ReactNode,
  index: number,
  indexProp?: string,
): ReactNode {
  if (!indexProp || !isValidElement(node)) return node;
  return cloneElement(node, { [indexProp]: index });
}

/**
 * 반복 렌더링 컴포넌트
 * - `times` 로 지정한 횟수만큼 children을 렌더링
 *
 * @example
 * ```tsx
 * <Repeat.Times times={10}>
 *   {(index) => <Component order={index} />}
 * </Repeat.Times>
 * ```
 *
 */
export type RepeatTimesProps = {
  /** 반복 횟수
   * - 0이하인 경우 렌더링되지 않음 */
  times: number;
  children: (index: number) => ReactNode;
  indexProp?: string;
};

export function RepeatTimes({ times = 0, children, indexProp }: RepeatTimesProps) {
  if (times <= 0) return null;

  return (
    <>
      {Array.from({ length: times }, (_, index) => (
        <Fragment key={index}>
          {applyIndexProp(children(index), index, indexProp)}
        </Fragment>
      ))}
    </>
  );
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
 *   {(user) => <Component user={user} />}
 * </Repeat.Each>
 * ```
 */
export type RepeatEachProps<T> = {
  /** 반복할 배열 */
  each: T[];
  children: (item: T, index: number) => ReactNode;
  /** key 결정 전략
   * - 있으면: 이 함수로 key 생성
   * - 없으면: item.id가 있으면 id 사용
   * - 둘 다 아니면: index 사용
   */
  itemKey?: (item: T, index: number) => Key;
  indexProp?: string;
};

/** 배열 기반 반복 렌더링 */
export function RepeatEach<T>({ each = [], children, itemKey, indexProp }: RepeatEachProps<T>) {
  if (!each || each.length === 0) return null;

  return (
    <>
      {each.map((item, index) => (
        <Fragment key={resolveKey(item, index, itemKey)}>
          {applyIndexProp(children(item, index), index, indexProp)}
        </Fragment>
      ))}
    </>
  );
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
