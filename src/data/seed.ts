// Deterministic mock data for "Demo Commerce Group".
// Everything is generated from a fixed seed so every visitor sees the same numbers,
// and every number on screen can be traced back to the daily rows below.

export type StoreId = "glow-lab" | "vita-core" | "pure-skin";
export type AngleId = "ugc-pain" | "before-after" | "founder" | "offer" | "comparison";

export interface Store {
  id: StoreId;
  name: string;
  category: string;
  aovTarget: number;
}

export interface Strategist {
  code: string;
  name: string;
  role: string;
}

export interface Angle {
  id: AngleId;
  label: string;
}

export interface Product {
  slug: string;
  name: string;
  store: StoreId;
}

/** One row per store per day. Shopify is the source of truth for revenue/orders. */
export interface StoreDay {
  date: string; // YYYY-MM-DD (store timezone)
  store: StoreId;
  revenue: number; // Shopify net sales, EUR
  orders: number;
  metaSpend: number;
  googleSpend: number;
  metaReportedRevenue: number; // what Meta Ads Manager claims (7d click / 1d view)
  cogs: number;
  fees: number; // payment, shipping & app fees
}

export interface CreativeDay {
  day: number; // days since launch (0 = launch day)
  spend: number;
  revenue: number; // Meta-attributed purchase value
  impressions: number;
  clicks: number;
}

export interface Creative {
  id: string;
  adName: string; // follows strategist_angle_product_version
  strategist: string;
  angle: AngleId;
  product: string;
  store: StoreId;
  version: number;
  format: "Video" | "Static" | "Carousel";
  launchDate: string;
  campaign: string;
  adSet: string;
  daily: CreativeDay[];
}

export const DATA_END = "2026-10-22";
export const HISTORY_DAYS = 180;

export const STORES: Store[] = [
  { id: "glow-lab", name: "Glow Lab", category: "Skincare", aovTarget: 52 },
  { id: "vita-core", name: "Vita Core", category: "Supplements", aovTarget: 41 },
  { id: "pure-skin", name: "Pure Skin", category: "Clean beauty", aovTarget: 36 },
];

export const STRATEGISTS: Strategist[] = [
  { code: "AH", name: "Anna Hartmann", role: "Senior strategist" },
  { code: "LM", name: "Lucas Moreau", role: "Creative strategist" },
  { code: "SV", name: "Sofie Visser", role: "Creative strategist" },
  { code: "MR", name: "Marco Rossi", role: "Performance creative" },
  { code: "JK", name: "Julia Kowalski", role: "Junior strategist" },
];

export const ANGLES: Angle[] = [
  { id: "ugc-pain", label: "UGC pain point" },
  { id: "before-after", label: "Before / after" },
  { id: "founder", label: "Founder story" },
  { id: "offer", label: "Offer-led" },
  { id: "comparison", label: "Comparison" },
];

export const PRODUCTS: Product[] = [
  { slug: "serum", name: "Vitamin C Serum", store: "glow-lab" },
  { slug: "eyecream", name: "Peptide Eye Cream", store: "glow-lab" },
  { slug: "spf", name: "Daily SPF 50", store: "glow-lab" },
  { slug: "collagen", name: "Marine Collagen", store: "vita-core" },
  { slug: "magnesium", name: "Sleep Magnesium", store: "vita-core" },
  { slug: "greens", name: "Daily Greens", store: "vita-core" },
  { slug: "cleanser", name: "Gentle Cleanser", store: "pure-skin" },
  { slug: "moisturiser", name: "Barrier Moisturiser", store: "pure-skin" },
  { slug: "patches", name: "Blemish Patches", store: "pure-skin" },
];

// ---------- deterministic PRNG ----------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261022);
const gauss = () => {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const lognorm = (sigma: number) => Math.exp(gauss() * sigma - (sigma * sigma) / 2);
const pick = <T,>(arr: T[], weights?: number[]) => {
  if (!weights) return arr[Math.floor(rand() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
};
const r2 = (n: number) => Math.round(n * 100) / 100;

const DAY_MS = 86_400_000;
const END_MS = Date.parse(DATA_END + "T00:00:00Z");
export const dateAt = (index: number) =>
  new Date(END_MS - (HISTORY_DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10);

// ---------- store-level daily data ----------
const STORE_PROFILE: Record<StoreId, { rev: number; roas: number; growth: number; cogs: number; metaShare: number; metaInflation: number }> = {
  "glow-lab": { rev: 14200, roas: 2.95, growth: 0.28, cogs: 0.24, metaShare: 0.8, metaInflation: 1.17 },
  "vita-core": { rev: 9600, roas: 2.7, growth: 0.08, cogs: 0.3, metaShare: 0.72, metaInflation: 1.24 },
  "pure-skin": { rev: 6100, roas: 2.35, growth: 0.36, cogs: 0.27, metaShare: 0.84, metaInflation: 1.12 },
};
// Mon..Sun multipliers (DTC beauty tends to peak Sunday/Monday)
const WEEKDAY = [1.08, 1.0, 0.97, 0.95, 0.93, 0.98, 1.1];

function buildStoreDays(): StoreDay[] {
  const rows: StoreDay[] = [];
  for (const s of STORES) {
    const p = STORE_PROFILE[s.id];
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const date = dateAt(i);
      const t = i / (HISTORY_DAYS - 1);
      const dow = (new Date(date + "T00:00:00Z").getUTCDay() + 6) % 7;
      const trend = 1 + p.growth * (t - 0.5);
      const promo = i >= 150 && i <= 153 ? 1.45 : 1; // late-September autumn sale
      const spend = (p.rev / p.roas) * trend * WEEKDAY[dow] * lognorm(0.07) * (promo > 1 ? 1.25 : 1);
      const revenue = spend * p.roas * lognorm(0.09) * (promo > 1 ? promo / 1.25 : 1);
      const metaSpend = spend * p.metaShare;
      const orders = Math.max(1, Math.round(revenue / (s.aovTarget * lognorm(0.05))));
      rows.push({
        date,
        store: s.id,
        revenue: r2(revenue),
        orders,
        metaSpend: r2(metaSpend),
        googleSpend: r2(spend - metaSpend),
        metaReportedRevenue: r2(metaSpend * p.roas * p.metaInflation * lognorm(0.12)),
        cogs: r2(revenue * p.cogs),
        fees: r2(revenue * 0.029 + orders * 4.1),
      });
    }
  }
  return rows;
}

// ---------- creatives ----------
// Strategist profile: mean quality, spread, favourite angles.
const STRAT_PROFILE: Record<string, { q: number; sigma: number; fav: AngleId[] }> = {
  AH: { q: 1.1, sigma: 0.36, fav: ["ugc-pain", "before-after"] },
  LM: { q: 1.0, sigma: 0.24, fav: ["founder", "comparison"] },
  SV: { q: 1.05, sigma: 0.28, fav: ["before-after", "comparison"] },
  MR: { q: 1.06, sigma: 0.11, fav: ["offer", "ugc-pain"] },
  JK: { q: 0.93, sigma: 0.3, fav: ["ugc-pain", "offer"] },
};
const ANGLE_BASE: Record<AngleId, { q: number; ctr: number }> = {
  "ugc-pain": { q: 1.06, ctr: 1.25 },
  "before-after": { q: 1.0, ctr: 1.4 },
  founder: { q: 0.97, ctr: 0.95 },
  offer: { q: 0.99, ctr: 1.75 },
  comparison: { q: 1.0, ctr: 1.1 },
};
// Where an angle over/under-performs by store
const AFFINITY: Partial<Record<`${AngleId}|${StoreId}`, number>> = {
  "before-after|glow-lab": 1.34,
  "before-after|vita-core": 0.8,
  "before-after|pure-skin": 0.88,
  "founder|vita-core": 1.2,
  "founder|pure-skin": 0.9,
  "comparison|pure-skin": 1.06,
  "offer|vita-core": 0.92,
};
const CAMPAIGN_TYPES = ["Prospecting", "Creative testing", "Scaling"] as const;
const AUDIENCES = ["Broad 25-54", "Advantage+", "Lookalike 2%", "Interest: skincare", "Interest: wellness"];
const FORMATS: Creative["format"][] = ["Video", "Static", "Carousel"];

function buildCreatives(): Creative[] {
  const creatives: Creative[] = [];
  const versions = new Map<string, number>();
  const N = 124;
  // launch dates spread over the last ~90 days, generated in order so v2 always follows v1
  const launches = Array.from({ length: N }, () => HISTORY_DAYS - 1 - Math.floor(rand() * 89)).sort((a, b) => a - b);
  for (let n = 0; n < N; n++) {
    const strategist = pick(STRATEGISTS.map((s) => s.code), [1.15, 1.05, 1, 1.1, 0.8]);
    const sp = STRAT_PROFILE[strategist];
    const angle: AngleId =
      rand() < 0.55 ? pick(sp.fav) : pick(ANGLES.map((a) => a.id));
    const store = pick(STORES.map((s) => s.id), [0.44, 0.32, 0.24]);
    const product = pick(PRODUCTS.filter((p) => p.store === store));
    const key = `${strategist}_${angle}_${product.slug}`;
    const version = (versions.get(key) ?? 0) + 1;
    versions.set(key, version);

    const launchIndex = launches[n];
    const iterBonus = version > 1 ? 1.08 : 1; // iterations of a concept tend to do better
    const quality =
      sp.q * ANGLE_BASE[angle].q * (AFFINITY[`${angle}|${store}`] ?? 1) * iterBonus * lognorm(sp.sigma);
    const baseRoas = 1.78 * quality;
    const baseCtr = 0.0085 * ANGLE_BASE[angle].ctr * Math.sqrt(quality) * lognorm(0.15);
    const format = angle === "offer" ? pick(FORMATS, [0.3, 0.55, 0.15]) : pick(FORMATS, [0.7, 0.2, 0.1]);
    const cpm = 9 + rand() * 5;

    const daily: CreativeDay[] = [];
    const maxDays = HISTORY_DAYS - launchIndex;
    const testBudget = 48 + rand() * 40;
    let spend7 = 0;
    let rev7 = 0;
    let scaled = false;
    let killedAt = 999;
    const lifespan = 18 + Math.floor(rand() * 40);
    for (let d = 0; d < maxDays; d++) {
      let budget: number;
      if (d < 7) {
        budget = testBudget * (0.85 + rand() * 0.3);
        // weak early signal → media buyer kills the test early
        if (d >= 3 && rev7 / Math.max(spend7, 1) < 1.1 && rand() < 0.5) killedAt = Math.min(killedAt, d);
      } else {
        if (d === 7) scaled = rev7 / Math.max(spend7, 1) >= 2.0 && spend7 >= 300;
        if (!scaled) {
          if (d > 10) break;
          budget = testBudget * 0.6;
        } else {
          if (d > lifespan) break;
          const ramp = Math.min(1, (d - 6) / 6);
          budget = (120 + quality * 260) * ramp * lognorm(0.15) + testBudget;
        }
      }
      if (d >= killedAt) break;
      const fatigue = scaled ? Math.max(0.55, 1 - Math.max(0, d - 12) * 0.012) : 1;
      const spend = r2(budget);
      const revenue = r2(spend * baseRoas * fatigue * lognorm(0.32));
      const impressions = Math.round((spend / cpm) * 1000);
      const clicks = Math.round(impressions * baseCtr * lognorm(0.1));
      daily.push({ day: d, spend, revenue, impressions, clicks });
      if (d < 7) {
        spend7 += spend;
        rev7 += revenue;
      }
    }

    const campaignType = scaled ? "Scaling" : pick([...CAMPAIGN_TYPES].slice(0, 2), [0.35, 0.65]);
    const storeShort = STORES.find((s) => s.id === store)!.name.replace(" ", "");
    creatives.push({
      id: `cr-${String(n + 1).padStart(3, "0")}`,
      adName: `${strategist}_${angle}_${product.slug}_v${version}`,
      strategist,
      angle,
      product: product.slug,
      store,
      version,
      format,
      launchDate: dateAt(launchIndex),
      campaign: `${storeShort} | ${campaignType} | EU`,
      adSet: `${pick(AUDIENCES)} | ${product.name}`,
      daily,
    });
  }
  return creatives.sort((a, b) => (a.launchDate < b.launchDate ? 1 : -1));
}

export const STORE_DAYS: StoreDay[] = buildStoreDays();
export const CREATIVES: Creative[] = buildCreatives();
