"use client";
import { STORES } from "@/data/seed";
import { useDashboard } from "@/components/providers";
import { Segmented } from "@/components/ui/segmented";
import { NativeSelect } from "@/components/ui/select";
import { periodBounds, type RangeDays, type StoreFilter } from "@/lib/metrics";
import { fmtDate } from "@/lib/utils";

export function FilterBar({ showRange = true }: { showRange?: boolean }) {
  const { store, setStore, range, setRange } = useDashboard();
  const b = periodBounds(range);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NativeSelect aria-label="Store" value={store} onChange={(e) => setStore(e.target.value as StoreFilter)} className="min-w-36">
        <option value="all">All stores</option>
        {STORES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </NativeSelect>
      {showRange && (
        <>
          <Segmented<RangeDays>
            ariaLabel="Date range"
            value={range}
            onChange={setRange}
            options={[
              { value: 7, label: "7d" },
              { value: 30, label: "30d" },
              { value: 90, label: "90d" },
            ]}
          />
          <span className="hidden text-xs text-muted-foreground lg:inline">
            {fmtDate(b.start)} – {fmtDate(b.end)} · vs {fmtDate(b.prevStart)} – {fmtDate(b.prevEnd)}
          </span>
        </>
      )}
    </div>
  );
}
