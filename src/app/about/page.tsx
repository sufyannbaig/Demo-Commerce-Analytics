import type { Metadata } from "next";
import { ArrowDown, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "How we'd build your analytics platform · Demo Commerce Group" };

const SOURCES = ["Shopify Admin API", "Meta Marketing API", "Google Ads API"];
const PIPELINE = [
  { t: "Scheduled sync jobs", d: "Node workers pull new + changed data every hour, full re-check nightly" },
  { t: "Raw tables (Postgres)", d: "An untouched copy of what each API returned, kept for audits" },
  { t: "Clean, modelled tables", d: "One row per order, per ad per day, in EUR and store time" },
  { t: "Next.js dashboard", d: "Fast, filterable screens like this demo, on your own login" },
];

const ACCURACY = [
  ["Shopify is the source of truth for revenue.", "Ad platforms' own revenue is shown next to it, never instead of it."],
  ["No duplicates.", "Orders are keyed by order ID; ad data by ad ID + date. Re-running a sync updates rows, it never adds copies."],
  ["Full history.", "We backfill everything the APIs allow on day one, then keep it, even if the platform later drops it."],
  ["Rate limits and pagination handled.", "Jobs page through every result, slow down when asked and retry failures automatically."],
  ["One currency, the right day.", "Everything converted to EUR at the daily rate; each store's day follows its own timezone."],
  ["Checks you can see.", "Daily totals are compared with Shopify and Ads Manager; any gap above 1% gets flagged."],
];

const DEFINITIONS = [
  ["Winner rule", "e.g. ROAS ≥ 2.0 after ≥ €300 spend within 7 days"],
  ["Profit", "revenue − COGS − ad spend − fees (payment, shipping, apps)"],
  ["Attribution window", "e.g. Meta 7-day click / 1-day view"],
  ["Store vs total", "which costs are shared, and how they're split per store"],
];

const PHASES = [
  ["Audit + data rules", "Walk through your reference dashboard, agree every definition above, map each metric to its source."],
  ["Syncs + database", "Connect all stores and ad accounts, backfill history, run accuracy checks against the platforms."],
  ["Overview + creative screens", "Revenue, spend, ROAS, profit by store and period; creative and strategist performance."],
  ["Advanced insights", "Angle analysis, winning-creative patterns, cross-store / product / campaign comparisons."],
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[900px] rounded-xl border border-border bg-card p-6 text-[13px] leading-relaxed shadow-xs sm:p-9 print:max-w-none print:rounded-none print:border-0 print:p-[13mm] print:text-[11.5px] print:leading-normal print:shadow-none">
      <header className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between print:flex-row print:items-end print:justify-between print:pb-3">
        <div>
          <div className="text-[11px] font-semibold tracking-wider text-primary uppercase">Data plan · one page</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight print:text-[20px]">How we&apos;d build your analytics platform</h1>
          <p className="mt-1 text-muted-foreground">One trusted view of revenue, ad spend, profit and creative performance across every store.</p>
        </div>
        <span className="self-start rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-amber-800 sm:self-auto">
          Demo · mock data
        </span>
      </header>

      <section className="mt-5 print:mt-6">
        <h2 className="text-[13px] font-semibold tracking-wide uppercase print:text-[11px]">1 · Architecture</h2>
        <div className="mt-3 flex flex-col items-stretch gap-2 md:flex-row md:items-center print:mt-2 print:flex-row print:items-center">
          <div className="flex flex-col gap-1.5 md:w-40 print:w-32">
            {SOURCES.map((s) => (
              <div key={s} className="rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-center text-[12px] font-medium print:py-1 print:text-[10px]">
                {s}
              </div>
            ))}
          </div>
          {PIPELINE.map((p) => (
            <div key={p.t} className="flex flex-col items-center gap-2 md:flex-1 md:flex-row print:flex-1 print:flex-row">
              <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground md:block print:block print:size-3" />
              <ArrowDown className="size-4 shrink-0 text-muted-foreground md:hidden print:hidden" />
              <div className="w-full rounded-md border border-primary/25 bg-primary/5 px-2.5 py-2 print:px-2 print:py-1.5">
                <div className="text-[12.5px] font-semibold print:text-[10.5px]">{p.t}</div>
                <div className="text-[11.5px] text-muted-foreground print:text-[9.5px]">{p.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 print:mt-7 print:grid-cols-2 print:gap-5">
        <section>
          <h2 className="text-[13px] font-semibold tracking-wide uppercase print:text-[11px]">2 · Accuracy rules</h2>
          <ul className="mt-2 space-y-2 print:space-y-1.5">
            {ACCURACY.map(([t, d]) => (
              <li key={t} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary print:size-3" />
                <span>
                  <span className="font-semibold">{t}</span> <span className="text-muted-foreground">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6 print:space-y-6">
          <section>
            <h2 className="text-[13px] font-semibold tracking-wide uppercase print:text-[11px]">3 · Definitions to agree on day 1</h2>
            <dl className="mt-2 divide-y divide-border rounded-md border border-border">
              {DEFINITIONS.map(([k, v]) => (
                <div key={k} className="flex gap-3 px-3 py-1.5 print:py-1">
                  <dt className="w-32 shrink-0 font-semibold print:w-28">{k}</dt>
                  <dd className="text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold tracking-wide uppercase print:text-[11px]">4 · Ad naming convention</h2>
            <p className="mt-2">
              Every ad is named <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold">strategist_angle_product_version</code>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1 font-mono text-[12px] print:text-[10px]">
              {[
                ["AH", "strategist"],
                ["ugc-pain", "angle"],
                ["serum", "product"],
                ["v3", "version"],
              ].map(([v, k], i) => (
                <span key={k} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground">_</span>}
                  <span className="flex flex-col items-center rounded-md bg-primary/8 px-2 py-1">
                    <span className="font-semibold">{v}</span>
                    <span className="font-sans text-[10px] text-muted-foreground print:text-[8.5px]">{k}</span>
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-muted-foreground">
              The sync reads the name, so win rates per strategist and angle appear automatically. Names that don&apos;t match get flagged in a weekly list instead of silently ignored.
            </p>
          </section>
        </div>
      </div>

      <section className="mt-6 print:mt-7">
        <h2 className="text-[13px] font-semibold tracking-wide uppercase print:text-[11px]">5 · Phases</h2>
        <ol className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
          {PHASES.map(([t, d], i) => (
            <li key={t} className="rounded-md border border-border p-3 print:p-2">
              <div className="flex items-center gap-2">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-white print:size-4 print:text-[9px]">{i + 1}</span>
                <span className="font-semibold">{t}</span>
              </div>
              <p className="mt-1.5 text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-5 border-t border-border pt-3 text-[11.5px] text-muted-foreground print:mt-6 print:pt-2 print:text-[9px]">
        You get a working screen at the end of every phase, on real data, so you can check the numbers against what you already trust before we build further.
      </footer>
    </article>
  );
}
