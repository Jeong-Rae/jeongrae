import { modulo } from "@lyght/ts";

/**
 * 기준 배열을 따라 다른 배열의 요소를 순환하며 결합한다.
 *
 * 결과 배열의 길이는 항상 `base` 배열의 길이와 동일하며,
 * `cycle` 배열의 요소는 끝에 도달하면 처음부터 다시 사용된다.
 *
 * @typeParam T 기준 배열의 요소 타입
 * @typeParam U 순환 배열의 요소 타입
 *
 * @param base 결과 길이의 기준이 되는 배열
 * @param cycle 기준 배열에 맞춰 순환 참조되는 배열
 *
 * @returns
 * 각 인덱스에서 `base`의 요소와 `cycle`의 요소를 묶은 튜플 배열.
 * `cycle`이 더 짧은 경우, 요소는 순환하여 사용된다.
 *
 * @example
 * ```ts
 * zipCycle([1, 2, 3], ['a', 'b']);
 * // -> [[1, 'a'], [2, 'b'], [3, 'a']]
 * ```
 *
 * @remarks
 * - `cycle` 배열이 비어 있는 경우, 빈 배열을 반환한다.
 * - 입력 배열은 변경되지 않는다.
 */
export function zipCycle<T, U>(
  base: readonly T[],
  cycle: readonly U[],
): [T, U][] {
  const len = base.length;
  const cycleLen = cycle.length;

  if (cycleLen === 0) {
    return [];
  }

  const result = new Array<[T, U]>(len);

  for (let i = 0; i < len; i++) {
    result[i] = [base[i], cycle[modulo(i, cycleLen) ?? 0]];
  }

  return result;
}
