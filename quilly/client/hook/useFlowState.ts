import { useCallback, useEffect, useRef, useState } from "react";

export type GuardResult = true | { reason: string };

export type FlowTransitions<P extends string> = Record<P, readonly P[]>;

export type FlowGuards<P extends string> = Partial<Record<P, () => GuardResult>>;

export type FlowNextMap<P extends string> = Partial<Record<P, P>>;

export type UseFlowStateParams<P extends string> = {
  initial: P;
  transitions: FlowTransitions<P>;
  guards?: FlowGuards<P>;
  next?: FlowNextMap<P>;
};

export type UseFlowStateResult<P extends string> = {
  phase: P;
  canTransition: (to: P) => GuardResult;
  transition: (to: P) => boolean;
  canNext: () => GuardResult;
  next: () => boolean;
};

export function useFlowState<P extends string>(
  params: UseFlowStateParams<P>,
): UseFlowStateResult<P> {
  const { initial, transitions, guards, next } = params;
  const [phase, setPhase] = useState<P>(initial);

  const transitionsRef = useRef(transitions);
  const guardsRef = useRef(guards);
  const nextRef = useRef(next);

  useEffect(() => {
    transitionsRef.current = transitions;
  }, [transitions]);

  useEffect(() => {
    guardsRef.current = guards;
  }, [guards]);

  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const canTransition = useCallback(
    (to: P): GuardResult => {
      const allowed = transitionsRef.current[phase]?.includes(to);
      if (!allowed) {
        return { reason: "transition-not-allowed" };
      }

      const guard = guardsRef.current?.[to];
      if (!guard) return true;
      return guard();
    },
    [phase],
  );

  const transition = useCallback(
    (to: P) => {
      const result = canTransition(to);
      if (result !== true) return false;
      setPhase(to);
      return true;
    },
    [canTransition],
  );

  const canNext = useCallback((): GuardResult => {
    const nextPhase = nextRef.current?.[phase];
    if (!nextPhase) return { reason: "next-not-defined" };
    return canTransition(nextPhase);
  }, [canTransition, phase]);

  const nextTransition = useCallback(() => {
    const nextPhase = nextRef.current?.[phase];
    if (!nextPhase) return false;
    return transition(nextPhase);
  }, [phase, transition]);

  return {
    phase,
    canTransition,
    transition,
    canNext,
    next: nextTransition,
  };
}
