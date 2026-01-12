import * as React from "react";

import { inputSizeClasses, type UISize } from "../lib/size";
import { cn } from "../lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "size"> & { size?: UISize }
>(({ className, type, size = "md", ...props }, ref) => {
  return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-transparent py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          inputSizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
  );
});
Input.displayName = "Input";

export { Input };
