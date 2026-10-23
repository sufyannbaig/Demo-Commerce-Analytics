import {
  ANGLES,
  CREATIVES,
  DATA_END,
  HISTORY_DAYS,
  STORES,
  STORE_DAYS,
  STRATEGISTS,
  dateAt,
  type AngleId,
  type Creative,
  type StoreId,
} from "@/data/seed";

export type StoreFilter = "all" | StoreId;
export type RangeDays = 7 | 30 | 90;

export interface WinnerRule {
  minRoas: number;
  minSpend: number;
  windowDays: number;
}
export const DEFAULT_RULE: WinnerRule = { minRoas: 2.0, minSpend: 300, windowDays: 7 };

const DAY_MS = 86_400_000;
const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY_MS);

export const safeDiv = (a: number, b: number) => (b === 0 ? 0 : a / b);
export const pctChange = (cur: number, prev: number) => (prev === 0 ? 0 : (cur - prev) / Math.abs(prev));

// ---------------- Overview ----------------
export interface Totals {
  revenue: number;
  spend: number;
  metaSpend: number;
  googleSpend: number;
  metaReportedRevenue: number;
  profit: number;
  orders: number;
  cogs: number;
  fees: number;
}

function sumRows(rows: typeof STORE_DAYS): Totals {
  const t: Totals = { revenue: 0, spend: 0, metaSpend: 0, googleSpend: 0, metaReportedRevenue: 0, profit: 0, orders: 0, cogs: 0, fees: 0 };
  for (const r of rows) {
    t.revenue += r.revenue;
    t.metaSpend += r.metaSpend;
    t.googleSpend += r.googleSpend;
    t.metaReportedRevenue += r.metaReportedRevenue;
    t.orders += r.orders;
    t.cogs += r.cogs;
    t.fees += r.fees;
  }
  t.spend = t.metaSpend + t.googleSpend;
  // Profit = revenue - COGS - ad spend - fees
  t.profit = t.revenue - t.cogs - t.spend - t.fees;
  return t;
}

export function periodBounds(range: RangeDays) {
  const endIdx = HISTORY_DAYS - 1;
  const startIdx = endIdx - range + 1;
  return {
    start: dateAt(startIdx),
    end: dateAt(endIdx),
    prevStart: dateAt(startIdx - range),
    prevEnd: dateAt(startIdx - 1),
  };
}

const inStore = (s: StoreFilter) => (id: StoreId) => s === "all" || s === id;

export function overview(store: StoreFilter, range: RangeDays) {
  const b = periodBounds(range);
  const match = inStore(store);
  const cur = STORE_DAYS.filter((r) => match(r.store) && r.date >= b.start && r.date <= b.end);
  const prev = STORE_DAYS.filter((r) => match(r.store) && r.date >= b.prevStart && r.date <= b.prevEnd);
  const t = sumRows(cur);
  const p = sumRows(prev);

  const kpi = (c: number, pv: number) => ({ value: c, change: pctChange(c, pv) });
  const kpis = {
    revenue: kpi(t.revenue, p.revenue),
    spend: kpi(t.spend, p.spend),
    blendedRoas: kpi(safeDiv(t.revenue, t.spend), safeDiv(p.revenue, p.spend)),
    metaRoas: kpi(safeDiv(t.metaReportedRevenue, t.metaSpend), safeDiv(p.metaReportedRevenue, p.metaSpend)),
    profit: kpi(t.profit, p.profit),
    orders: kpi(t.orders, p.orders),
    aov: kpi(safeDiv(t.revenue, t.orders), safeDiv(p.revenue, p.orders)),
  };

  // time series by day
  const byDate = new Map<string, { date: string; revenue: number; spend: number; profit: number }>();
  for (const r of cur) {
    const e = byDate.get(r.date) ?? { date: r.date, revenue: 0, spend: 0, profit: 0 };
    const sp = r.metaSpend + r.googleSpend;
    e.revenue += r.revenue;
    e.spend += sp;
    e.profit += r.revenue - r.cogs - sp - r.fees;
    byDate.set(r.date, e);
  }
  const series = [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));

  const perStore = STORES.map((s) => {
    const rows = STORE_DAYS.filter((r) => r.store === s.id && r.date >= b.start && r.date <= b.end);
    const prevRows = STORE_DAYS.filter((r) => r.store === s.id && r.date >= b.prevStart && r.date <= b.prevEnd);
    const st = sumRows(rows);
    const pv = sumRows(prevRows);
    return {
      id: s.id,
      name: s.name,
      category: s.category,
      revenue: st.revenue,
      revenueChange: pctChange(st.revenue, pv.revenue),
      spend: st.spend,
      blendedRoas: safeDiv(st.revenue, st.spend),
      metaRoas: safeDiv(st.metaReportedRevenue, st.metaSpend),
      profit: st.profit,
      margin: safeDiv(st.profit, st.revenue),
    };
  });

  return { bounds: b, totals: t, kpis, series, perStore };
}

// ---------------- Creatives ----------------
export type Status = "Winner" | "Testing" | "Loser";

export interface CreativeRow {
  c: Creative;
  status: Status;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  windowSpend: number;
  windowRoas: number;
}

/** Applies the winner rule to one creative using only its first `windowDays` days. */
export function evaluate(c: Creative, rule: WinnerRule): CreativeRow {
  const age = daysBetween(c.launchDate, DATA_END) + 1; // days of data available
  let ws = 0;
  let wr = 0;
  let spend = 0;
  let revenue = 0;
  let imp = 0;
  let clicks = 0;
  for (const d of c.daily) {
    spend += d.spend;
    revenue += d.revenue;
    imp += d.impressions;
    clicks += d.clicks;
    if (d.day < rule.windowDays) {
      ws += d.spend;
      wr += d.revenue;
    }
  }
  const windowRoas = safeDiv(wr, ws);
  let status: Status;
  if (ws >= rule.minSpend && windowRoas >= rule.minRoas) status = "Winner";
  else if (age < rule.windowDays) status = "Testing";
  else status = "Loser";
  return { c, status, spend, revenue, roas: safeDiv(revenue, spend), ctr: safeDiv(clicks, imp), windowSpend: ws, windowRoas };
}

export function creativeRows(rule: WinnerRule, store: StoreFilter, range: RangeDays) {
  const { start } = periodBounds(range);
  const match = inStore(store);
  return CREATIVES.filter((c) => match(c.store) && c.launchDate >= start).map((c) => evaluate(c, rule));
}

export interface GroupStats {
  key: string;
  launched: number;
  winners: number;
  losers: number;
  testing: number;
  decided: number;
  winRate: number;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
}

export function groupStats(rows: CreativeRow[], keyOf: (r: CreativeRow) => string): Map<string, GroupStats> {
  const m = new Map<string, GroupStats & { _imp: number; _clk: number }>();
  for (const r of rows) {
    const k = keyOf(r);
    const g = m.get(k) ?? { key: k, launched: 0, winners: 0, losers: 0, testing: 0, decided: 0, winRate: 0, spend: 0, revenue: 0, roas: 0, ctr: 0, _imp: 0, _clk: 0 };
    g.launched++;
    if (r.status === "Winner") g.winners++;
    else if (r.status === "Loser") g.losers++;
    else g.testing++;
    g.spend += r.spend;
    g.revenue += r.revenue;
    for (const d of r.c.daily) {
      g._imp += d.impressions;
      g._clk += d.clicks;
    }
    m.set(k, g);
  }
  for (const g of m.values()) {
    g.decided = g.winners + g.losers;
    // Win rate = winners / decided creatives (still-testing creatives are excluded)
    g.winRate = safeDiv(g.winners, g.decided);
    g.roas = safeDiv(g.revenue, g.spend);
    g.ctr = safeDiv(g._clk, g._imp);
  }
  return m;
}

export function leaderboard(rows: CreativeRow[]) {
  const m = groupStats(rows, (r) => r.c.strategist);
  return STRATEGISTS.map((s) => ({ ...s, ...(m.get(s.code) ?? emptyStats(s.code)) })).sort(
    (a, b) => b.winRate - a.winRate || b.roas - a.roas,
  );
}

const emptyStats = (key: string): GroupStats => ({ key, launched: 0, winners: 0, losers: 0, testing: 0, decided: 0, winRate: 0, spend: 0, revenue: 0, roas: 0, ctr: 0 });

export function byAngle(rows: CreativeRow[]) {
  const m = groupStats(rows, (r) => r.c.angle);
  return ANGLES.map((a) => ({ ...a, ...(m.get(a.id) ?? emptyStats(a.id)) }));
}

export function angleStoreMatrix(rows: CreativeRow[]) {
  const m = groupStats(rows, (r) => `${r.c.angle}|${r.c.store}`);
  return ANGLES.map((a) => ({
    angle: a,
    cells: STORES.map((s) => ({ store: s, stats: m.get(`${a.id}|${s.id}`) ?? emptyStats(`${a.id}|${s.id}`) })),
  }));
}

// ---------------- Insights ----------------
export interface Insight {
  id: string;
  kicker: string;
  headline: string;
  detail: string;
  metric: string;
  action: string;
}

export const angleLabel = (id: AngleId) => ANGLES.find((a) => a.id === id)!.label;
export const storeName = (id: StoreId) => STORES.find((s) => s.id === id)!.name;
export const strategistName = (code: string) => STRATEGISTS.find((s) => s.code === code)?.name ?? code;

const pct = (n: number) => `${Math.round(n * 100)}%`;
const x = (n: number) => `${n.toFixed(1)}×`;

/** Three insights computed from whatever rule + filters are active. */
export function insights(rows: CreativeRow[]): Insight[] {
  const out: Insight[] = [];
  const MIN = 5;

  // 1. Angle that wins disproportionately in one store
  let best: { angle: AngleId; store: StoreId; inRate: number; outRate: number; n: number; ratio: number; score: number } | null = null;
  for (const a of ANGLES) {
    for (const s of STORES) {
      const inside = rows.filter((r) => r.c.angle === a.id && r.c.store === s.id && r.status !== "Testing");
      const outside = rows.filter((r) => r.c.angle === a.id && r.c.store !== s.id && r.status !== "Testing");
      if (inside.length < MIN || outside.length < MIN) continue;
      const inRate = safeDiv(inside.filter((r) => r.status === "Winner").length, inside.length);
      const outRate = safeDiv(outside.filter((r) => r.status === "Winner").length, outside.length);
      if (outRate < 0.05) continue; // ratios against ~0% are noise, not insight
      const ratio = inRate / outRate;
      // weight by sample size so 3/5 doesn't beat 12/20
      const score = (inRate - outRate) * Math.sqrt(inside.length);
      if (!best || score > best.score) best = { angle: a.id, store: s.id, inRate, outRate, n: inside.length, ratio, score };
    }
  }
  if (best && best.ratio > 1.15) {
    out.push({
      id: "angle-store",
      kicker: "Angle × store",
      headline: `${angleLabel(best.angle)} wins ${x(best.ratio)} more often on ${storeName(best.store)} than on other stores`,
      detail: `${pct(best.inRate)} win rate on ${storeName(best.store)} (${best.n} tested) vs ${pct(best.outRate)} elsewhere.`,
      metric: x(best.ratio),
      action: `Brief more ${angleLabel(best.angle)} concepts for ${storeName(best.store)}; don't copy-paste it to the other stores.`,
    });
  }

  // 2. Strategist × angle specialism
  const team = groupStats(rows, () => "all").get("all");
  const combos = groupStats(rows, (r) => `${r.c.strategist}|${r.c.angle}`);
  const topCombo = [...combos.values()]
    .filter((g) => g.decided >= MIN)
    .sort((a, b) => b.winRate - a.winRate || b.decided - a.decided)[0];
  if (topCombo && team && team.winRate > 0 && topCombo.winRate >= team.winRate * 1.15) {
    const [code, angle] = topCombo.key.split("|") as [string, AngleId];
    out.push({
      id: "strategist-angle",
      kicker: "Team strength",
      headline: `${strategistName(code)} + ${angleLabel(angle)} is your most reliable combo`,
      detail: `${pct(topCombo.winRate)} win rate across ${topCombo.decided} decided creatives, vs a team average of ${pct(team.winRate)}.`,
      metric: x(topCombo.winRate / team.winRate),
      action: `Let ${strategistName(code).split(" ")[0]} document this angle as a brief template for the rest of the team.`,
    });
  }

  // 3. Iterations vs first versions
  const v1 = rows.filter((r) => r.c.version === 1 && r.status !== "Testing");
  const vN = rows.filter((r) => r.c.version > 1 && r.status !== "Testing");
  if (v1.length >= MIN && vN.length >= MIN) {
    const r1 = safeDiv(v1.filter((r) => r.status === "Winner").length, v1.length);
    const rN = safeDiv(vN.filter((r) => r.status === "Winner").length, vN.length);
    const better = rN >= r1;
    out.push({
      id: "iterations",
      kicker: "Winning pattern",
      headline: better
        ? `Iterations (v2+) win ${x(safeDiv(rN, r1 || 1))} as often as brand-new concepts`
        : `New concepts currently out-win iterations (${pct(r1)} vs ${pct(rN)})`,
      detail: `v1 win rate ${pct(r1)} (${v1.length} decided) vs v2+ win rate ${pct(rN)} (${vN.length} decided).`,
      metric: better ? x(safeDiv(rN, r1 || 1)) : pct(r1),
      action: better
        ? "Reserve roughly a third of weekly launches for new hooks on proven concepts."
        : "Shift more of the weekly testing budget to fresh concepts.",
    });
  }

  // Fallback so the page never shows an empty slot on narrow filters
  if (out.length < 3) {
    const angles = byAngle(rows).filter((a) => a.spend > 0).sort((a, b) => b.roas - a.roas);
    if (angles.length >= 2) {
      const top = angles[0];
      const low = angles[angles.length - 1];
      out.push({
        id: "angle-roas",
        kicker: "Spend efficiency",
        headline: `${top.label} returns ${x(safeDiv(top.roas, low.roas))} the ROAS of ${low.label.toLowerCase()}`,
        detail: `${top.roas.toFixed(2)} vs ${low.roas.toFixed(2)} ROAS on Meta across the selected period.`,
        metric: x(safeDiv(top.roas, low.roas)),
        action: `Cap budget on ${low.label.toLowerCase()} until a new hook proves itself.`,
      });
    }
  }
  return out.slice(0, 3);
}
