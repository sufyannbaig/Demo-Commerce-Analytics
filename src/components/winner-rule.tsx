"use client";
import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useDashboard } from "@/components/providers";
import { InfoTip } from "@/components/ui/tooltip";
import { DEFAULT_RULE, type WinnerRule } from "@/lib/metrics";
import { cn } from "@/lib/utils";

function Stepper({
  value,
  onChange,
  step,
  min,
  max,
  prefix,
  suffix,
  decimals = 0,
  label,
  width,
}: {
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  width: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const [draft, setDraft] = React.useState<string | null>(null); // text while the user is typing
  return (
    <span className="inline-flex items-center rounded-lg bg-white/95 text-slate-900 shadow-sm ring-1 ring-black/5">
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => { setDraft(null); onChange(clamp(value - step)); }} className="grid size-7 place-items-center rounded-l-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Minus className="size-3.5" />
      </button>
      <span className="flex items-center font-semibold tabular-nums">
        {prefix}
        <input
          aria-label={label}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={draft ?? value.toFixed(decimals)}
          onChange={(e) => {
            setDraft(e.target.value);
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          onBlur={() => setDraft(null)}
          className={cn("bg-transparent text-center outline-none", width)}
        />
        {suffix}
      </span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => { setDraft(null); onChange(clamp(value + step)); }} className="grid size-7 place-items-center rounded-r-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
        <Plus className="size-3.5" />
      </button>
    </span>
  );
}

const PRESETS: { label: string; rule: WinnerRule }[] = [
  { label: "Lenient", rule: { minRoas: 1.5, minSpend: 200, windowDays: 7 } },
  { label: "Default", rule: DEFAULT_RULE },
  { label: "Strict", rule: { minRoas: 2.5, minSpend: 500, windowDays: 7 } },
];

export function WinnerRuleBar({ summary }: { summary: React.ReactNode }) {
  const { rule, setRule } = useDashboard();
  const isDefault = rule.minRoas === DEFAULT_RULE.minRoas && rule.minSpend === DEFAULT_RULE.minSpend && rule.windowDays === DEFAULT_RULE.windowDays;
  const set = (patch: Partial<WinnerRule>) => setRule({ ...rule, ...patch });

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1d5fb0] to-[#2a78d6] p-4 text-white shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-white/80 uppercase">
            Winner rule
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10.5px] font-semibold normal-case tracking-normal">Editable · recalculates live</span>
            <InfoTip label="About the winner rule" className="text-white/80 hover:text-white">
              A creative is a Winner when, within its first {rule.windowDays} days, it spends at least €{rule.minSpend} at a Meta ROAS of {rule.minRoas.toFixed(1)} or higher. Creatives still inside that window are Testing; everything else is a Loser. Win rate = winners ÷ decided creatives.
            </InfoTip>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px] font-medium sm:text-base">
            <span>Winner = ROAS ≥</span>
            <Stepper label="minimum ROAS" value={rule.minRoas} onChange={(v) => set({ minRoas: v })} step={0.1} min={0.5} max={5} decimals={1} width="w-9" />
            <span>after ≥</span>
            <Stepper label="minimum spend" value={rule.minSpend} onChange={(v) => set({ minSpend: v })} step={50} min={0} max={2000} prefix="€" width="w-11" />
            <span>spend within</span>
            <Stepper label="window in days" value={rule.windowDays} onChange={(v) => set({ windowDays: v })} step={1} min={3} max={14} width="w-6" />
            <span>days</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((p) => {
              const active = p.rule.minRoas === rule.minRoas && p.rule.minSpend === rule.minSpend && p.rule.windowDays === rule.windowDays;
              return (
                <button
                  key={p.label}
                  onClick={() => setRule(p.rule)}
                  className={cn("rounded-full px-3 py-1 text-[12.5px] font-medium ring-1 ring-white/30 transition-colors hover:bg-white/15", active && "bg-white text-[#1d5fb0] hover:bg-white")}
                >
                  {p.label}
                </button>
              );
            })}
            {!isDefault && (
              <button onClick={() => setRule(DEFAULT_RULE)} className="ml-1 inline-flex items-center gap-1 text-[12.5px] text-white/80 hover:text-white">
                <RotateCcw className="size-3" /> Reset
              </button>
            )}
          </div>
          <div className="text-[13px] text-white/90">{summary}</div>
        </div>
      </div>
    </div>
  );
}
