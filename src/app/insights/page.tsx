"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lightbulb, Pencil, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { useDashboard } from "@/components/providers";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/tooltip";
import { angleStoreMatrix, byAngle, creativeRows, insights } from "@/lib/metrics";
import { cn, fmtEur, fmtPct, fmtRoas } from "@/lib/utils";

// sequential blue ramp (light → dark) for the angle × store heatmap
const RAMP = ["#e8f1fc", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"];
const rampColor = (t: number) => RAMP[Math.min(RAMP.length - 1, Math.max(0, Math.floor(t * RAMP.length)))];

function AngleBars({ data, dataKey, name, format, domainMax, step }: { data: object[]; dataKey: string; name: string; format: (v: number) => string; domainMax: number; step: number }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 22, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="short" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickMargin={6} />
          <YAxis tickFormatter={format} width={40} tickLine={false} axisLine={false} domain={[0, domainMax]}
            ticks={Array.from({ length: Math.round(domainMax / step) + 1 }, (_, i) => i * step)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={(p) => (
              <ChartTooltip
                active={p.active}
                payload={p.payload as never}
                label={(p.payload?.[0]?.payload as { label?: string })?.label}
                valueFormatter={(v) => format(v)}
              />
            )}
          />
          <Bar dataKey={dataKey} name={name} fill="var(--series-1)" radius={[4, 4, 0, 0]} maxBarSize={56}>
            <LabelList dataKey={dataKey} position="top" formatter={(v: unknown) => format(Number(v))} style={{ fontSize: 11, fontWeight: 600, fill: "var(--foreground)" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const SHORT: Record<string, string> = {
  "ugc-pain": "UGC pain",
  "before-after": "Before/after",
  founder: "Founder",
  offer: "Offer-led",
  comparison: "Comparison",
};

export default function InsightsPage() {
  const { store, range, rule } = useDashboard();
  const rows = useMemo(() => creativeRows(rule, store, range), [rule, store, range]);
  const angles = useMemo(() => byAngle(rows).map((a) => ({ ...a, short: SHORT[a.id], winRatePct: a.winRate * 100 })), [rows]);
  const matrix = useMemo(() => angleStoreMatrix(creativeRows(rule, "all", range)), [rule, range]);
  const cards = useMemo(() => insights(rows), [rows]);
  const MIN_N = 3; // below this a cell is shown but not coloured: too few creatives to trust
  const maxRate = Math.max(...matrix.flatMap((m) => m.cells.filter((c) => c.stats.decided >= MIN_N).map((c) => c.stats.winRate)), 0.01);

  return (
    <>
      <PageHeader
        title="Angles & Insights"
        description="Which messaging angles win, where they win, and patterns across your winning creatives."
        actions={<FilterBar />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px] sm:mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
          Winner = ROAS ≥ {rule.minRoas.toFixed(1)} after ≥ €{rule.minSpend} spend within {rule.windowDays} days
        </span>
        <Link href="/creatives" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <Pencil className="size-3" /> Edit rule
        </Link>
        <span className="text-muted-foreground">· {rows.length} creatives in view</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c, i) => (
          <Card key={c.id} className="relative flex flex-col overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-primary uppercase">
                {i === 0 ? <Sparkles className="size-3.5" /> : <Lightbulb className="size-3.5" />}
                {c.kicker}
              </span>
              <span className="rounded-md bg-muted px-2 py-0.5 text-[13px] font-semibold tabular-nums">{c.metric}</span>
            </div>
            <h3 className="mt-3 text-[15.5px] leading-snug font-semibold">{c.headline}</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">{c.detail}</p>
            <p className="mt-auto border-t border-border pt-3 text-[13px]">
              <span className="font-medium">Next step: </span>
              {c.action}
            </p>
          </Card>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        Insights are computed from the data on every load, not hand-written. Change the rule or filters and they update.
        <InfoTip label="How insights are computed">
          Each card scans every angle × store, strategist × angle and version combination with at least 5 decided creatives, then surfaces the biggest gap versus the rest. Small samples are ignored so one lucky ad can&apos;t top the list.
        </InfoTip>
      </p>

      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Win rate by angle</CardTitle>
            <CardDescription>Winners ÷ decided creatives, under the current rule.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-5">
            <AngleBars data={angles} dataKey="winRatePct" name="Win rate" format={(v) => `${Math.round(v)}%`} domainMax={100} step={25} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ROAS by angle</CardTitle>
            <CardDescription>Meta-reported purchase value ÷ spend, lifetime of each creative.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-5">
            <AngleBars data={angles} dataKey="roas" name="ROAS" format={(v) => `${v.toFixed(1)}×`} domainMax={Math.max(2, Math.ceil(Math.max(...angles.map((a) => a.roas))  * 2) / 2)} step={0.5} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1">
              Angle × store win rate
              <InfoTip label="About this matrix">Always shows all three stores so you can compare them, regardless of the store filter. Darker = higher win rate. n = decided creatives. Cells with fewer than 3 are greyed out as low sample.</InfoTip>
            </CardTitle>
            <CardDescription>Same angle, different store, very different outcome.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground" />
                    {matrix[0].cells.map((c) => (
                      <th key={c.store.id} className="pb-1 text-center text-xs font-medium text-muted-foreground">
                        {c.store.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((m) => (
                    <tr key={m.angle.id}>
                      <td className="pr-2 text-[13px] font-medium whitespace-nowrap">{m.angle.label}</td>
                      {m.cells.map((c) => {
                        const reliable = c.stats.decided >= MIN_N;
                        const t = Math.min(1, c.stats.winRate / maxRate);
                        const dark = reliable && t > 0.6;
                        return (
                          <td
                            key={c.store.id}
                            className={cn("h-14 rounded-md text-center align-middle tabular-nums", !reliable && "bg-muted")}
                            style={reliable ? { background: rampColor(t * 0.999) } : undefined}
                            title={`${m.angle.label} on ${c.store.name}: ${c.stats.winners}/${c.stats.decided} winners, ${fmtRoas(c.stats.roas)} ROAS`}
                          >
                            {c.stats.decided ? (
                              <>
                                <div className={cn("text-[14px] font-semibold", dark ? "text-white" : reliable ? "text-slate-900" : "text-muted-foreground")}>{fmtPct(c.stats.winRate)}</div>
                                <div className={cn("text-[11px]", dark ? "text-white/80" : "text-slate-600")}>n={c.stats.decided}{!reliable && " · low sample"}</div>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">–</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Angle scorecard</CardTitle>
            <CardDescription>Everything behind the charts, in one table.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="py-2 pl-5 text-left font-medium">Angle</th>
                    <th className="px-2 py-2 text-right font-medium">Tested</th>
                    <th className="px-2 py-2 text-right font-medium">Win rate</th>
                    <th className="px-2 py-2 text-right font-medium">ROAS</th>
                    <th className="px-2 py-2 text-right font-medium">CTR</th>
                    <th className="py-2 pr-5 text-right font-medium">Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {[...angles]
                    .sort((a, b) => b.winRate - a.winRate)
                    .map((a) => (
                      <tr key={a.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 pl-5 font-medium whitespace-nowrap">{a.label}</td>
                        <td className="px-2 text-right tabular-nums">{a.launched}</td>
                        <td className="px-2 text-right font-semibold tabular-nums">{a.decided ? fmtPct(a.winRate) : "–"}</td>
                        <td className="px-2 text-right tabular-nums">{fmtRoas(a.roas)}</td>
                        <td className="px-2 text-right tabular-nums">{fmtPct(a.ctr, 2)}</td>
                        <td className="pr-5 text-right tabular-nums whitespace-nowrap">{fmtEur(a.spend)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
