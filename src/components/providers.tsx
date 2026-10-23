"use client";
import * as React from "react";
import { DEFAULT_RULE, type RangeDays, type StoreFilter, type WinnerRule } from "@/lib/metrics";
import { TooltipProvider } from "@/components/ui/tooltip";

interface DashboardState {
  store: StoreFilter;
  setStore: (s: StoreFilter) => void;
  range: RangeDays;
  setRange: (r: RangeDays) => void;
  rule: WinnerRule;
  setRule: (r: WinnerRule) => void;
}

const Ctx = React.createContext<DashboardState | null>(null);
const KEY = "dcg-demo-state-v1";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = React.useState<StoreFilter>("all");
  const [range, setRange] = React.useState<RangeDays>(90);
  const [rule, setRule] = React.useState<WinnerRule>(DEFAULT_RULE);
  const loaded = React.useRef(false);

  // Filters and the winner rule follow the viewer across screens (per-browser convenience only).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.store) setStore(s.store);
        if ([7, 30, 90].includes(s.range)) setRange(s.range);
        if (s.rule?.minRoas && s.rule?.minSpend >= 0) setRule({ ...DEFAULT_RULE, ...s.rule });
      }
    } catch {}
    loaded.current = true;
  }, []);
  React.useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ store, range, rule }));
    } catch {}
  }, [store, range, rule]);

  return (
    <Ctx.Provider value={{ store, setStore, range, setRange, rule, setRule }}>
      <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
    </Ctx.Provider>
  );
}

export function useDashboard() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useDashboard must be used inside DashboardProvider");
  return v;
}
