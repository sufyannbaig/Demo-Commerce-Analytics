"use client";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Search } from "lucide-react";
import { ANGLES, PRODUCTS, STRATEGISTS } from "@/data/seed";
import { PageHeader } from "@/components/app-shell";
import { FilterBar } from "@/components/filter-bar";
import { useDashboard } from "@/components/providers";
import { WinnerRuleBar } from "@/components/winner-rule";
import { Avatar, StatusBadge, Thumb } from "@/components/creative-bits";
import { CreativeDialog } from "@/components/creative-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { NativeSelect } from "@/components/ui/select";
import { InfoTip } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_RULE, angleLabel, creativeRows, groupStats, leaderboard, type CreativeRow, type Status } from "@/lib/metrics";
import { cn, fmtEur, fmtPct, fmtRoas } from "@/lib/utils";

type SortKey = "launch" | "spend" | "roas" | "ctr";
type View = "creative" | "campaign" | "adset";

const NamingTip = () => (
  <InfoTip label="How strategist and angle are detected">
    Strategist and angle come from the ad naming convention <span className="font-mono">strategist_angle_product_version</span>, e.g.{" "}
    <span className="font-mono">AH_ugc-pain_serum_v3</span> = Anna Hartmann, UGC pain-point angle, Vitamin C Serum, 3rd iteration. No manual tagging needed.
  </InfoTip>
);

export default function CreativesPage() {
  const { store, range, rule } = useDashboard();
  const rows = useMemo(() => creativeRows(rule, store, range), [rule, store, range]);
  const baseRows = useMemo(() => creativeRows(DEFAULT_RULE, store, range), [store, range]);
  const board = useMemo(() => leaderboard(rows), [rows]);
  const baseBoard = useMemo(() => leaderboard(baseRows), [baseRows]);
  const team = useMemo(() => groupStats(rows, () => "t").get("t"), [rows]);
  const baseTeam = useMemo(() => groupStats(baseRows, () => "t").get("t"), [baseRows]);

  const [status, setStatus] = useState<"all" | Status>("all");
  const [strat, setStrat] = useState("all");
  const [angle, setAngle] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("spend");
  const [limit, setLimit] = useState(12);
  const [view, setView] = useState<View>("creative");
  const [open, setOpen] = useState<CreativeRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (strat === "all" || r.c.strategist === strat) &&
        (angle === "all" || r.c.angle === angle) &&
        (!q || r.c.adName.toLowerCase().includes(q)),
    );
    const by: Record<SortKey, (r: CreativeRow) => number | string> = {
      launch: (r) => r.c.launchDate,
      spend: (r) => r.spend,
      roas: (r) => r.roas,
      ctr: (r) => r.ctr,
    };
    return [...list].sort((a, b) => (by[sort](a) < by[sort](b) ? 1 : -1));
  }, [rows, status, strat, angle, query, sort]);

  const grouped = useMemo(() => {
    if (view === "creative") return [];
    const m = groupStats(filtered, (r) => (view === "campaign" ? r.c.campaign : r.c.adSet));
    return [...m.values()].sort((a, b) => b.spend - a.spend);
  }, [filtered, view]);

  const counts = {
    Winner: rows.filter((r) => r.status === "Winner").length,
    Testing: rows.filter((r) => r.status === "Testing").length,
    Loser: rows.filter((r) => r.status === "Loser").length,
  };
  const winDelta = (team?.winRate ?? 0) - (baseTeam?.winRate ?? 0);
  const isDefault = rule.minRoas === DEFAULT_RULE.minRoas && rule.minSpend === DEFAULT_RULE.minSpend && rule.windowDays === DEFAULT_RULE.windowDays;
  const maxWin = Math.max(...board.map((b) => b.winRate), 0.01);

  return (
    <>
      <PageHeader
        title="Creative & Team"
        description="Which creatives win, and who on the team makes them. Creatives launched in the selected period."
        actions={<FilterBar />}
      />

      <WinnerRuleBar
        summary={
          <>
            <span className="font-semibold">{counts.Winner} winners</span> of {counts.Winner + counts.Loser} decided ·{" "}
            <span className="font-semibold">team win rate {fmtPct(team?.winRate ?? 0)}</span>
            {!isDefault && (
              <span className="ml-1.5 rounded bg-white/15 px-1.5 py-0.5 text-[12px] tabular-nums">
                {winDelta >= 0 ? "+" : "−"}
                {Math.abs(Math.round(winDelta * 100))} pts vs default
              </span>
            )}
          </>
        }
      />

      <div className="mt-4 flex min-w-0 flex-col gap-4 sm:mt-6 sm:gap-6">
        <Card>
          <CardHeader className="sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-1">
                Strategist leaderboard <NamingTip />
              </CardTitle>
              <CardDescription>Ranked by win rate. Arrows show rank movement versus the default rule.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Strategist</TableHead>
                  <TableHead className="text-right">Launched</TableHead>
                  <TableHead className="text-right">Winners</TableHead>
                  <TableHead className="min-w-44">Win rate</TableHead>
                  <TableHead className="text-right">Avg ROAS</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {board.map((s, i) => {
                  const baseRank = baseBoard.findIndex((b) => b.code === s.code);
                  const move = baseRank - i;
                  return (
                    <TableRow key={s.code} className="cursor-pointer" onClick={() => setStrat(strat === s.code ? "all" : s.code)}>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {i + 1}
                          {move !== 0 && (
                            <span className={cn("flex items-center text-[11px] font-semibold", move > 0 ? "text-good-ink" : "text-bad-ink")}>
                              {move > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                              {Math.abs(move)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar code={s.code} />
                          <div>
                            <div className={cn("font-medium", strat === s.code && "text-primary")}>{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{s.launched}</TableCell>
                      <TableCell className="text-right">{s.winners}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-2 w-full max-w-28 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(s.winRate / maxWin) * 100}%` }} />
                          </div>
                          <span className="w-10 text-right font-semibold">{fmtPct(s.winRate)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{fmtRoas(s.roas)}</TableCell>
                      <TableCell className="text-right">{fmtEur(s.spend)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-1">
                  {view === "creative" ? "Creatives" : view === "campaign" ? "Campaigns" : "Ad sets"} <NamingTip />
                </CardTitle>
                <CardDescription>
                  {view === "creative" ? "Click a creative to see its day-by-day history." : "Aggregated from the creatives that match your filters."} ROAS and CTR as reported by Meta.
                </CardDescription>
              </div>
              <Segmented<View>
                ariaLabel="View by"
                value={view}
                onChange={setView}
                options={[
                  { value: "creative", label: "Creative" },
                  { value: "campaign", label: "Campaign" },
                  { value: "adset", label: "Ad set" },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Segmented<"all" | Status>
                ariaLabel="Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: `All ${rows.length}` },
                  { value: "Winner", label: `Winners ${counts.Winner}` },
                  { value: "Testing", label: `Testing ${counts.Testing}` },
                  { value: "Loser", label: `Losers ${counts.Loser}` },
                ]}
              />
              <NativeSelect aria-label="Strategist" value={strat} onChange={(e) => setStrat(e.target.value)}>
                <option value="all">All strategists</option>
                {STRATEGISTS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </NativeSelect>
              <NativeSelect aria-label="Angle" value={angle} onChange={(e) => setAngle(e.target.value)}>
                <option value="all">All angles</option>
                {ANGLES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </NativeSelect>
              <NativeSelect aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="spend">Sort: spend</option>
                <option value="roas">Sort: ROAS</option>
                <option value="ctr">Sort: CTR</option>
                <option value="launch">Sort: newest</option>
              </NativeSelect>
              <label className="relative flex-1 sm:max-w-56">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ad name…"
                  aria-label="Search ad name"
                  className="h-8 w-full rounded-lg border border-border bg-card pr-2 pl-8 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-3">
            {view === "creative" ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Creative</TableHead>
                      <TableHead>Strategist</TableHead>
                      <TableHead>Angle</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                      <TableHead className="text-right">
                        <span className="inline-flex items-center gap-0.5">
                          ROAS
                          <InfoTip label="About ROAS here">
                            Top: lifetime ROAS. Below: ROAS in the first {rule.windowDays} days, which is what the winner rule judges. A creative can win its test and fade later.
                          </InfoTip>
                        </span>
                      </TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-6" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.slice(0, limit).map((r) => (
                      <TableRow key={r.c.id} className="cursor-pointer" onClick={() => setOpen(r)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Thumb c={r.c} />
                            <div>
                              <div className="font-mono text-[12.5px] font-medium">{r.c.adName}</div>
                              <div className="text-xs text-muted-foreground">
                                {r.c.format} · {r.c.launchDate.slice(8)}/{r.c.launchDate.slice(5, 7)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar code={r.c.strategist} className="size-6 text-[10px]" />
                            <span className="text-[13px]">{STRATEGISTS.find((s) => s.code === r.c.strategist)?.name.split(" ")[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px]">{angleLabel(r.c.angle)}</TableCell>
                        <TableCell className="text-[13px] text-muted-foreground">{PRODUCTS.find((p) => p.slug === r.c.product)?.name}</TableCell>
                        <TableCell className="text-right">{fmtEur(r.spend)}</TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold">{fmtRoas(r.roas)}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {rule.windowDays}d: {r.windowSpend ? fmtRoas(r.windowRoas) : "–"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{fmtPct(r.ctr, 2)}</TableCell>
                        <TableCell>
                          <StatusBadge status={r.status} />
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                          No creatives match these filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {filtered.length > limit && (
                  <div className="flex justify-center pt-3">
                    <Button variant="outline" size="sm" onClick={() => setLimit((l) => l + 24)}>
                      Show more ({filtered.length - limit} remaining)
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{view === "campaign" ? "Campaign" : "Ad set"}</TableHead>
                    <TableHead className="text-right">Creatives</TableHead>
                    <TableHead className="text-right">Winners</TableHead>
                    <TableHead className="text-right">Win rate</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grouped.map((g) => (
                    <TableRow key={g.key}>
                      <TableCell className="font-medium">{g.key}</TableCell>
                      <TableCell className="text-right">{g.launched}</TableCell>
                      <TableCell className="text-right">{g.winners}</TableCell>
                      <TableCell className="text-right">{g.decided ? fmtPct(g.winRate) : "–"}</TableCell>
                      <TableCell className="text-right">{fmtEur(g.spend)}</TableCell>
                      <TableCell className="text-right font-semibold">{fmtRoas(g.roas)}</TableCell>
                      <TableCell className="text-right">{fmtPct(g.ctr, 2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreativeDialog row={open} onClose={() => setOpen(null)} />
    </>
  );
}
