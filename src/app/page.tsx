"use client";
import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { STORES } from "@/data/seed";
import { PageHeader } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { useDashboard } from "@/components/providers";
import { KpiCard } from "@/components/kpi-card";
import { RevenueSpendChart } from "@/components/charts/revenue-spend-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTip } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { overview, safeDiv } from "@/lib/metrics";
import { cn, fmtChange, fmtEur, fmtEur2, fmtEurCompact, fmtInt, fmtPct, fmtRoas } from "@/lib/utils";

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)"];

export default function OverviewPage() {
  const { store, setStore, range } = useDashboard();
  const o = useMemo(() => overview(store, range), [store, range]);
  const k = o.kpis;
  const storeLabel = store === "all" ? "All stores" : STORES.find((s) => s.id === store)!.name;
  const totals = o.perStore.reduce(
    (a, s) => ({ revenue: a.revenue + s.revenue, spend: a.spend + s.spend, profit: a.profit + s.profit }),
    { revenue: 0, spend: 0, profit: 0 },
  );

  return (
    <>
      <PageHeader
        title="Overview"
        description="Revenue, ad spend and profit across every store, compared with the previous period of the same length."
        actions={<FilterBar />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          className="col-span-2"
          label="Revenue"
          value={fmtEur(k.revenue.value)}
          change={k.revenue.change}
          hint="Net sales from Shopify orders (after discounts and refunds, excl. VAT). Shopify is the source of truth for revenue."
        >
          <div className="hidden h-12 w-40 sm:block" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={o.series}>
                <Area dataKey="revenue" type="monotone" stroke="var(--series-1)" strokeWidth={1.5} fill="var(--series-1)" fillOpacity={0.08} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KpiCard>
        <KpiCard
          label="Ad spend"
          value={fmtEur(k.spend.value)}
          change={k.spend.change}
          neutral
          sub={`Meta ${fmtPct(safeDiv(o.totals.metaSpend, o.totals.spend))} · Google ${fmtPct(safeDiv(o.totals.googleSpend, o.totals.spend))}`}
          hint="Meta Ads + Google Ads spend, converted to EUR at the daily rate."
        />
        <KpiCard
          label="Profit"
          value={fmtEur(k.profit.value)}
          change={k.profit.change}
          hint="Profit = revenue − COGS − ad spend − fees (payment, shipping and app fees). Formula to be agreed on day 1."
        />
        <KpiCard
          label="Blended ROAS"
          value={fmtRoas(k.blendedRoas.value)}
          change={k.blendedRoas.change}
          hint="Shopify revenue ÷ total ad spend (Meta + Google). The number your bank account agrees with."
        />
        <KpiCard
          label="Meta-reported ROAS"
          value={fmtRoas(k.metaRoas.value)}
          change={k.metaRoas.change}
          sub={`${fmtChange(safeDiv(k.metaRoas.value, k.blendedRoas.value) - 1)} vs blended`}
          hint="Purchase value Meta attributes to its own ads (7-day click, 1-day view) ÷ Meta spend. Shown next to blended ROAS so over-attribution is visible."
        />
        <KpiCard label="Orders" value={fmtInt(k.orders.value)} change={k.orders.change} hint="Shopify orders, excluding test and fully refunded orders." />
        <KpiCard label="AOV" value={fmtEur2(k.aov.value)} change={k.aov.change} hint="Average order value = revenue ÷ orders." />
      </div>

      <Card className="mt-4 sm:mt-6">
        <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-1">
              Revenue vs ad spend · {storeLabel}
              <InfoTip label="How revenue and ROAS are calculated">
                Revenue comes from Shopify orders. Blended ROAS = Shopify revenue / total ad spend. Meta-reported ROAS shown alongside for comparison.
              </InfoTip>
            </CardTitle>
            <CardDescription>Daily, EUR. Hover for exact values.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-[var(--series-1)]" /> Revenue (Shopify)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-[var(--series-2)]" /> Ad spend (Meta + Google)
            </span>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-5">
          <RevenueSpendChart data={o.series} />
        </CardContent>
      </Card>

      <Card className="mt-4 sm:mt-6">
        <CardHeader>
          <CardTitle>Stores</CardTitle>
          <CardDescription>Click a store to filter the whole dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Store</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Ad spend</TableHead>
                <TableHead className="text-right">Blended ROAS</TableHead>
                <TableHead className="text-right">Meta ROAS</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {o.perStore.map((s, i) => (
                <TableRow
                  key={s.id}
                  onClick={() => setStore(store === s.id ? "all" : s.id)}
                  className={cn("cursor-pointer", store === s.id && "bg-primary/5 hover:bg-primary/8", store !== "all" && store !== s.id && "opacity-55")}
                >
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full" style={{ background: SERIES[i] }} />
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-medium">{fmtEur(s.revenue)}</div>
                    <div className={cn("text-xs", s.revenueChange >= 0 ? "text-good-ink" : "text-bad-ink")}>{fmtChange(s.revenueChange)}</div>
                  </TableCell>
                  <TableCell className="text-right">{fmtEur(s.spend)}</TableCell>
                  <TableCell className="text-right font-medium">{fmtRoas(s.blendedRoas)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{fmtRoas(s.metaRoas)}</TableCell>
                  <TableCell className="text-right">{fmtEur(s.profit)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted sm:block">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(1, s.margin / 0.4)) * 100}%` }} />
                      </div>
                      {fmtPct(s.margin, 1)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/40 font-semibold hover:bg-muted/40">
                <TableCell>Total group</TableCell>
                <TableCell className="text-right">{fmtEurCompact(totals.revenue)}</TableCell>
                <TableCell className="text-right">{fmtEurCompact(totals.spend)}</TableCell>
                <TableCell className="text-right">{fmtRoas(safeDiv(totals.revenue, totals.spend))}</TableCell>
                <TableCell className="text-right text-muted-foreground">–</TableCell>
                <TableCell className="text-right">{fmtEurCompact(totals.profit)}</TableCell>
                <TableCell className="text-right">{fmtPct(safeDiv(totals.profit, totals.revenue), 1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
