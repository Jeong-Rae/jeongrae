"use client";

import { cn } from "@/lib/utils";
import { type Phase, PHASES } from "@/lib/types";
import { Check } from "lucide-react";

interface PhaseStepperProps {
  currentPhase: Phase;
  onPhaseClick?: (phase: Phase) => void;
}

export function PhaseStepper({
  currentPhase,
  onPhaseClick,
}: PhaseStepperProps) {
  const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = phase.id === currentPhase;
        const isClickable = index <= currentIndex;

        return (
          <div key={phase.id} className="flex items-center">
            <button
              onClick={() => isClickable && onPhaseClick?.(phase.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                isCompleted && "text-emerald-400 hover:bg-emerald-500/10",
                isCurrent &&
                  "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50",
                !isCompleted && !isCurrent && "text-muted-foreground",
                isClickable && "cursor-pointer",
                !isClickable && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs",
                  isCompleted && "bg-emerald-500 text-black",
                  isCurrent &&
                    "bg-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : phase.step}
              </span>
              <span className="hidden sm:inline">{phase.label}</span>
            </button>
            {index < PHASES.length - 1 && (
              <div
                className={cn(
                  "w-4 h-px mx-1",
                  index < currentIndex ? "bg-emerald-500" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
