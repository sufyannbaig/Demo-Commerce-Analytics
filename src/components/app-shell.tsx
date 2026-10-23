"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, Lightbulb, Palette, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/creatives", label: "Creative & Team", icon: Palette },
  { href: "/insights", label: "Angles & Insights", icon: Lightbulb },
  { href: "/about", label: "Data plan", icon: FileText },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 place-items-center rounded-lg bg-primary text-[13px] font-bold text-white">DC</div>
      <div className="leading-tight">
        <div className="text-[13.5px] font-semibold text-white">Demo Commerce</div>
        <div className="text-[11px] text-slate-400">Group analytics</div>
      </div>
    </div>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-amber-800",
        className,
      )}
      title="All numbers on this page are generated mock data"
    >
      <span className="size-1.5 rounded-full bg-amber-500" />
      Demo data
    </span>
  );
}

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-dvh lg:flex print:block print:min-h-0">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 bg-sidebar lg:block print:hidden">
        <div className="sticky top-0 flex h-dvh flex-col px-4 py-5">
        <Logo />
        <nav className="mt-8 flex flex-col gap-0.5" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-sidebar-foreground transition-colors hover:bg-white/5 hover:text-white",
                isActive(path, href) && "bg-white/10 text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 rounded-lg border border-white/10 p-3 text-[12px] text-slate-400">
          <div className="font-medium text-slate-200">Sources</div>
          {["Shopify · 3 stores", "Meta Ads · 3 accounts", "Google Ads · 3 accounts"].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {s}
            </div>
          ))}
          <div className="flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[11.5px]">
            <RefreshCw className="size-3" /> Last sync 22 Oct, 06:00 (mock)
          </div>
        </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 bg-sidebar lg:hidden print:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo />
          <DemoBadge />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2.5 [scrollbar-width:none]" aria-label="Main">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium text-sidebar-foreground",
                isActive(path, href) && "bg-white/12 text-white",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 print:p-0">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <div className="mb-1.5 hidden items-center gap-2 lg:flex">
          <span className="text-xs font-medium text-muted-foreground">Demo Commerce Group</span>
          <DemoBadge />
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}
