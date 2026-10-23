"use client";
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs rounded-lg bg-slate-900 px-3 py-2 text-[12.5px] leading-relaxed text-slate-50 shadow-lg animate-in fade-in-0 zoom-in-95",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

/** Small (i) icon that reveals an explanation. Opens on hover, focus and tap. */
export function InfoTip({ children, label = "More info", className }: { children: React.ReactNode; label?: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={100}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={() => setOpen((o) => !o)}
          className={cn("inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
