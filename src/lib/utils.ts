import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const eur0 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eur2 = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const int = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 0 });

export const fmtEur = (n: number) => eur0.format(n);
export const fmtEur2 = (n: number) => eur2.format(n);
export const fmtInt = (n: number) => int.format(n);
export function fmtEurCompact(n: number) {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `€${(n / 1_000_000).toFixed(2)}M`;
  if (a >= 10_000) return `€${Math.round(n / 1000)}k`;
  if (a >= 1_000) return `€${(n / 1000).toFixed(1)}k`;
  return eur0.format(n);
}
export const fmtRoas = (n: number) => `${n.toFixed(2)}×`;
export const fmtPct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;
export const fmtChange = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(1)}%`;
export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
