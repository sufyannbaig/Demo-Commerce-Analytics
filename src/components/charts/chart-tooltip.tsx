/** Shared Recharts tooltip body: values in ink colours, the swatch carries series identity. */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  label?: string | number;
  labelFormatter?: (l: string | number) => string;
  valueFormatter: (v: number, key?: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-40 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <div className="mb-1.5 font-medium text-foreground">{labelFormatter ? labelFormatter(label ?? "") : label}</div>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-foreground">{valueFormatter(Number(p.value), String(p.dataKey))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
