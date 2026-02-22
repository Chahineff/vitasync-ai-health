import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full", className)}
    style={{ backgroundColor: "#E2E8F0" }}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full bg-primary rounded-full"
      style={{
        width: `${value || 0}%`,
        transition: "width 500ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
