import { useEffect, useRef } from "react";
import { useEvent } from "./useEvent";
import { isNumber } from "es-toolkit/compat";
import { isNil } from "es-toolkit";

type TMs = `${number}ms`;
type TSec = `${number}s`;
type TMin = `${number}m`;

export type TimeInput = number | TMs | TSec | TMin;

export type UseScheduleEffectParams = {
  after?: TimeInput;
  every?: TimeInput;
  until?: () => boolean;
  do: () => void;
  immediate?: boolean;
};

type TimerId = ReturnType<typeof setTimeout> | null;

const parseTime = (value: TimeInput): number => {
  if (isNumber(value)) {
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }

  const raw = value.trim().toLowerCase();

  if (raw.endsWith("ms")) {
    const n = Number(raw.slice(0, -2));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  if (raw.endsWith("s")) {
    const n = Number(raw.slice(0, -1));
    return Number.isFinite(n) && n >= 0 ? n * 1000 : 0;
  }

  if (raw.endsWith("m")) {
    const n = Number(raw.slice(0, -1));
    return Number.isFinite(n) && n >= 0 ? n * 60_000 : 0;
  }
  return 0;
};

/**
 * after / every / until 기반 스케줄 효과 훅
 *
 * @param params - 스케줄 효과 설정
 * @param params.after - 한 번 실행할 지연 시간 (number는 ms, "2s", "1m" 등 지원)
 * @param params.every - 반복 실행 간격 (number는 ms, "2s", "1m" 등 지원)
 * @param params.until - true가 되면 스케줄 중단
 * @param params.do - 실행할 함수
 * @param params.immediate - every 시작 시 즉시 한 번 실행할지 여부
 *
 * @example
 * <useScheduleEffect({ after: "1s", do: () => console.log("done") })/>
 * <useScheduleEffect({ every: "2s", do: () => console.log("tick") })/>
 * <useScheduleEffect({ every: "1s", immediate: true, do: () => console.log("now") })/>
 *
 * @warning after와 every를 함께 지정하면 every만 사용하고 after는 무시
 */
export function useScheduleEffect(params: UseScheduleEffectParams): void {
  const { after, every, immediate, until, do: run } = params;

  const runEvent = useEvent(run);
  const untilEvent = useEvent(until ?? (() => false));

  const timeoutRef = useRef<TimerId>(null);
  const intervalRef = useRef<TimerId>(null);

  useEffect(() => {
    const stop = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (untilEvent()) {
      return;
    }

    let useAfter = after;
    let useEvery = every;

    if (!isNil(after) && !isNil(every)) {
      useAfter = undefined;
      useEvery = every;
    }

    if (isNil(useAfter) && isNil(useEvery)) {
      return stop;
    }

    if (!isNil(useAfter)) {
      const delay = parseTime(useAfter);
      timeoutRef.current = setTimeout(() => {
        if (!untilEvent()) {
          runEvent();
        }
      }, delay);
    }

    if (!isNil(useEvery)) {
      const interval = parseTime(useEvery);

      if (immediate && !untilEvent()) {
        runEvent();
      }

      intervalRef.current = setInterval(() => {
        if (untilEvent()) {
          stop();
          return;
        }
        runEvent();
      }, interval);
    }

    return stop;
  }, [after, every, immediate, runEvent, untilEvent]);
}
