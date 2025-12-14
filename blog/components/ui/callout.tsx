import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

import {
  AlertTriangleIcon,
  InfoIcon,
  LightbulbIcon,
  StarIcon,
  XCircleIcon,
} from "lucide-react";

export type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

type CalloutPreset = {
  icon: React.ElementType;
  className: string;
};

const CALLOUT_PRESET: Record<CalloutType, CalloutPreset> = {
  note: {
    icon: InfoIcon,
    className:
      "border-note-border bg-note-background text-note-text [&>svg]:text-note-icon",
  },
  tip: {
    icon: LightbulbIcon,
    className:
      "border-tip-border bg-tip-background text-tip-text [&>svg]:text-tip-icon",
  },
  important: {
    icon: StarIcon,
    className:
      "border-primary/30 bg-primary/10 text-primary [&>svg]:text-primary",
  },
  warning: {
    icon: AlertTriangleIcon,
    className:
      "border-warning-border bg-warning-background text-warning-text [&>svg]:text-warning-icon",
  },
  caution: {
    icon: XCircleIcon,
    className:
      "border-caution-border bg-caution-background text-caution-text [&>svg]:text-caution-icon",
  },
};

/**
 * Callout 컴포넌트 props
 */
export type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Callout 루트 컴포넌트
 *
 * @param props 콜아웃 속성
 * @param props.type 콜아웃 유형
 * @param props.title 콜아웃 제목
 * @param props.children 콜아웃 내용
 * @param props.className 추가 클래스 이름
 *
 * @returns 콜아웃 UI
 *
 * @examples 각 타입별 예제
 * ```tsx
 * <Callout type="note">일반 안내입니다.</Callout>
 * <Callout type="tip">팁: 더 빠른 방법입니다.</Callout>
 * <Callout type="important">중요: 반드시 확인해주세요.</Callout>
 * <Callout type="warning" title="주의">되돌릴 수 없습니다.</Callout>
 * <Callout type="caution">주의: 안전을 확인하세요.</Callout>
 * ```
 */
export function CalloutRoot({
  type = "note",
  title = type,
  children,
  className,
}: CalloutProps) {
  const preset = CALLOUT_PRESET[type];
  const Icon = preset.icon;

  return (
    <Alert
      className={cn("flex items-start gap-3", preset.className, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />

      <div className="space-y-1">
        {<AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </div>
    </Alert>
  );
}

type PresetProps = Omit<CalloutProps, "type">;

function createPreset(type: CalloutType) {
  const Preset = ({ title, children, className }: PresetProps) => (
    <CalloutRoot type={type} title={title} className={className}>
      {children}
    </CalloutRoot>
  );

  Preset.displayName = `Callout.${type}`;
  return Preset;
}

/**
 * Callout 컴포넌트
 *
 * 사용 가능한 프리셋 예제
 * ```tsx
 * <Callout.Note>노트 내용입니다.</Callout.Note>
 * <Callout.Tip>이것은 팁입니다.</Callout.Tip>
 * <Callout.Important>중요한 알림입니다.</Callout.Important>
 * <Callout.Warning title="경고">주의가 필요합니다.</Callout.Warning>
 * <Callout.Caution>조심하세요.</Callout.Caution>
 * ```
 */
export const Callout = Object.assign(CalloutRoot, {
  Note: createPreset("note"),
  Tip: createPreset("tip"),
  Important: createPreset("important"),
  Warning: createPreset("warning"),
  Caution: createPreset("caution"),
});
