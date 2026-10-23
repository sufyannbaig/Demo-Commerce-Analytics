"use client";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { fmtDate, fmtEur, fmtEurCompact } from "@/lib/utils";

export function RevenueSpendChart({ data }: { data: { date: string; revenue: number; spend: number; profit: number }[] }) {
  const interval = data.length > 60 ? 13 : data.length > 20 ? 4 : 0;
  return (
    <div className="h-[280px] w-full sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            interval={interval}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickMargin={8}
          />
          <YAxis
            tickFormatter={fmtEurCompact}
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                payload={p.payload as never}
                label={p.label as string}
                labelFormatter={(l) => fmtDate(String(l))}
                valueFormatter={(v) => fmtEur(v)}
              />
            )}
          />
          <Area type="monotone" dataKey="revenue" name="Revenue (Shopify)" stroke="var(--series-1)" strokeWidth={2} fill="url(#revFill)" activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} />
          <Line type="monotone" dataKey="spend" name="Ad spend (Meta + Google)" stroke="var(--series-2)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
