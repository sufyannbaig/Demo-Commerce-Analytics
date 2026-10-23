"use client";
import { cn } from "@/lib/utils";

/** Compact segmented control (the shadcn ToggleGroup look, without the extra dependency). */
export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("inline-flex rounded-lg border border-border bg-card p-0.5", className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-[13px] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            o.value === value && "bg-primary text-primary-foreground shadow-xs hover:text-primary-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
