import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./badge.module.scss";

type BadgeVariant = "default" | "primary";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
  pill?: boolean;
}

export function Badge({ className, variant = "default", pill = false, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        variant === "primary" && styles["badge--primary"],
        pill && styles["badge--pill"],
        className,
      )}
      {...props}
    />
  );
}
