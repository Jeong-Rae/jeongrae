import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { cn } from "../lib/utils";

import {
  AlertTriangleIcon,
  InfoIcon,
  LightbulbIcon,
  MessageSquareWarningIcon,
  OctagonAlertIcon,
} from "lucide-react";
import { isString } from "es-toolkit";

export type CalloutType = "note" | "tip" | "important" | "warning" | "caution";

type CalloutPreset = {
  icon: React.ElementType;
  className: string;
  titleClassName: string;
  iconClassName: string;
};

const CALLOUT_PRESET: Record<CalloutType, CalloutPreset> = {
  note: {
    icon: InfoIcon,
    className: "text-note-text",
    titleClassName: "text-note-text",
    iconClassName: "text-note-icon",
  },
  tip: {
    icon: LightbulbIcon,
    className: "text-tip-text",
    titleClassName: "text-tip-text",
    iconClassName: "text-tip-icon",
  },
  important: {
    icon: MessageSquareWarningIcon,
    className: "text-primary",
    titleClassName: "text-primary",
    iconClassName: "text-primary",
  },
  warning: {
    icon: AlertTriangleIcon,
    className: "text-warning-text",
    titleClassName: "text-warning-text",
    iconClassName: "text-warning-icon",
  },
  caution: {
    icon: OctagonAlertIcon,
    className: "text-caution-text",
    titleClassName: "text-caution-text",
    iconClassName: "text-caution-icon",
  },
};

/**
 * Callout 컴포넌트 props
 */
export type CalloutProps = {
  type?: CalloutType | string;
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
  const normalizedType = isString(type) ? type.toLowerCase() : "note";
  const preset =
    CALLOUT_PRESET[normalizedType as CalloutType] ?? CALLOUT_PRESET.note;
  const Icon = preset.icon;

  return (
    <Alert className={cn("my-6 first:mt-0", preset.className, className)}>
      <div className="space-y-2">
        <AlertTitle
          className={cn(
            "mb-0 flex items-center gap-2 text-base text-sm tracking-tight",
            preset.titleClassName,
          )}
          style={{ marginLeft: "-1px" }}
        >
          <Icon className={cn("size-5 shrink-0", preset.iconClassName)} />
          {title}
        </AlertTitle>
        <AlertDescription className="ml-[26px]">{children}</AlertDescription>
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
