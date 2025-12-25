import { ReactNode, ComponentProps } from "react";
import { Button } from "./button";

type IconButtonSize = "icon" | "icon-sm" | "icon-lg";

export interface IconButtonProps
  extends Omit<ComponentProps<typeof Button>, "aria-label"> {
  icon: ReactNode;
  label?: string;
  position?: "left" | "right";
  size?: IconButtonSize;
}

/**
 * IconButton
 *
 * 아이콘 + 텍스트 조합이 가능한 버튼
 *
 * @param icon - 버튼에 표시할 아이콘
 * @param label - 접근성을 위한 aria-label 값 (기본값: "Icon Button")
 * @param position - 아이콘 위치 (기본값: "left")
 * @param size - 버튼 크기 (기본값: "icon-sm")
 * @param children - 버튼 텍스트 또는 내용
 *
 * @example
 * <IconButton icon={<CopyIcon />} label="Copy"/>
 * <IconButton icon={<CopyIcon />} label="Copy">Copy</IconButton>
 * <IconButton icon={<ChevronRightIcon />} position="right" label="Next">Next</IconButton>
 */
export function IconButton({
  icon,
  label = "Icon Button",
  position = "left",
  size = "icon-sm",
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button type={type} size={size} aria-label={label} {...props}>
      {position === "left" && icon}
      {children}
      {position === "right" && icon}
    </Button>
  );
}
