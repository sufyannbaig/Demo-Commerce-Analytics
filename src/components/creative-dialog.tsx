"use client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PRODUCTS, STORES } from "@/data/seed";
import { ChartTooltip } from "@/components/charts/chart-tooltip";
import { Avatar, StatusBadge, Thumb } from "@/components/creative-bits";
import { useDashboard } from "@/components/providers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { angleLabel, safeDiv, strategistName, type CreativeRow } from "@/lib/metrics";
import { fmtDate, fmtEur, fmtEurCompact, fmtPct, fmtRoas } from "@/lib/utils";

export function CreativeDialog({ row, onClose }: { row: CreativeRow | null; onClose: () => void }) {
  const { rule } = useDashboard();
  if (!row) return null;
  const c = row.c;
  let cs = 0;
  let cr = 0;
  const hist = c.daily.map((d) => {
    cs += d.spend;
    cr += d.revenue;
    return { day: `Day ${d.day + 1}`, spend: d.spend, roas: Number(safeDiv(cr, cs).toFixed(2)) };
  });
  const [strategist, angle, product, version] = c.adName.split("_");
  const parts = [
    { k: "Strategist", v: strategist, full: strategistName(c.strategist) },
    { k: "Angle", v: angle, full: angleLabel(c.angle) },
    { k: "Product", v: product, full: PRODUCTS.find((p) => p.slug === c.product)?.name },
    { k: "Version", v: version, full: `Iteration ${c.version}` },
  ];
  const windowEnd = `Day ${Math.min(rule.windowDays, hist.length)}`;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <div className="flex items-start gap-3 pr-8">
          <Thumb c={c} className="h-16 w-[52px]" />
          <div className="min-w-0">
            <DialogTitle className="truncate font-mono text-[15px] font-semibold">{c.adName}</DialogTitle>
            <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
              {STORES.find((s) => s.id === c.store)?.name} · {c.format} · launched {fmtDate(c.launchDate)}
            </DialogDescription>
            <div className="mt-2">
              <StatusBadge status={row.status} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {parts.map((p) => (
            <div key={p.k} className="rounded-lg border border-border px-3 py-2">
              <div className="text-[11px] text-muted-foreground">{p.k}</div>
              <div className="font-mono text-[13px] font-semibold">{p.v}</div>
              <div className="truncate text-[11.5px] text-muted-foreground">{p.full}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">Parsed automatically from the ad name. No manual tagging.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ["Lifetime spend", fmtEur(row.spend)],
            ["Lifetime ROAS", fmtRoas(row.roas)],
            [`First ${rule.windowDays}d spend`, fmtEur(row.windowSpend)],
            [`First ${rule.windowDays}d ROAS`, fmtRoas(row.windowRoas)],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[11.5px] text-muted-foreground">{k}</div>
              <div className="font-semibold tabular-nums">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-[12.5px] font-medium">Daily spend</div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" hide />
                  <YAxis tickFormatter={fmtEurCompact} width={44} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <ReferenceArea x1="Day 1" x2={windowEnd} fill="var(--series-1)" fillOpacity={0.06} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} content={(p) => <ChartTooltip active={p.active} payload={p.payload as never} label={p.label as string} valueFormatter={(v) => fmtEur(v)} />} />
                  <Bar dataKey="spend" name="Spend" fill="var(--series-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="mb-1 text-[12.5px] font-medium">Cumulative ROAS vs rule ({rule.minRoas.toFixed(1)}×)</div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="day" hide />
                  <YAxis width={44} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}×`} />
                  <ReferenceArea x1="Day 1" x2={windowEnd} fill="var(--series-1)" fillOpacity={0.06} />
                  <ReferenceLine y={rule.minRoas} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                  <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload as never} label={p.label as string} valueFormatter={(v) => fmtRoas(v)} />} />
                  <Line dataKey="roas" name="Cumulative ROAS" stroke="var(--series-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Shaded area = the {rule.windowDays}-day test window the rule looks at. {c.daily.length} days of history · CTR {fmtPct(row.ctr, 2)}.
        </p>

        <div className="mt-4 grid gap-2 rounded-lg bg-muted/60 p-3 text-[12.5px] sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Campaign: </span>
            <span className="font-medium">{c.campaign}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ad set: </span>
            <span className="truncate font-medium">{c.adSet}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Avatar code={c.strategist} className="size-6 text-[10px]" />
            <span className="font-medium">{strategistName(c.strategist)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
