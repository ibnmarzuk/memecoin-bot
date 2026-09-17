import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-md bg-secondary px-3.5 text-sm text-foreground placeholder:text-muted-foreground shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring/70 disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
