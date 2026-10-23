// Minimal stand-ins for next/link and next/navigation so the same pages run as one static file.
import * as React from "react";

const ROUTES: Record<string, string> = { "/": "overview", "/creatives": "creatives", "/insights": "insights", "/about": "plan" };
const fromHash = () => {
  const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#/, "");
  return Object.keys(ROUTES).find((p) => ROUTES[p] === h) ?? "/";
};

let current = fromHash();
const listeners = new Set<() => void>();
export function navigate(path: string) {
  if (!(path in ROUTES)) path = "/";
  current = path;
  try {
    history.replaceState(null, "", "#" + ROUTES[path]);
  } catch {}
  window.scrollTo({ top: 0 });
  listeners.forEach((l) => l());
}
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    current = fromHash();
    listeners.forEach((l) => l());
  });
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export function usePathname() {
  return React.useSyncExternalStore(subscribe, () => current, () => "/");
}
export function useRouter() {
  return { push: navigate, replace: navigate };
}

export default function Link({ href, onClick, ...props }: React.ComponentProps<"a"> & { href: string }) {
  return (
    <a
      href={"#" + (ROUTES[href] ?? "overview")}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}
