import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/tooltip";
import { cn, fmtChange } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,
  goodWhenUp = true,
  neutral = false,
  hint,
  sub,
  className,
  children,
}: {
  label: string;
  value: string;
  change: number;
  goodWhenUp?: boolean;
  neutral?: boolean;
  hint?: React.ReactNode;
  sub?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const up = change >= 0;
  const good = up === goodWhenUp;
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className={cn("flex flex-col justify-between gap-3 p-4 sm:p-5", className)}>
      <div className="flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
        {label}
        {hint && <InfoTip label={`About ${label}`}>{hint}</InfoTip>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[22px] font-semibold tracking-tight tabular-nums sm:text-2xl">{value}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                neutral ? "text-muted-foreground" : good ? "text-good-ink" : "text-bad-ink",
              )}
            >
              <Arrow className="size-3.5" />
              {fmtChange(change)}
            </span>
            <span className="text-muted-foreground">{sub ?? "vs prev. period"}</span>
          </div>
        </div>
        {children}
      </div>
    </Card>
  );
}
