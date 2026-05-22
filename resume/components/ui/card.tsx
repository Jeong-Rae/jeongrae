import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./card.module.scss";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn(styles.card, className)} {...props} />;
}
