import * as React from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/app-shell";
import { DashboardProvider } from "@/components/providers";
import OverviewPage from "@/app/page";
import CreativesPage from "@/app/creatives/page";
import InsightsPage from "@/app/insights/page";
import AboutPage from "@/app/about/page";
import { usePathname } from "./router";

const PAGES: Record<string, () => React.ReactElement> = {
  "/": OverviewPage,
  "/creatives": CreativesPage,
  "/insights": InsightsPage,
  "/about": AboutPage,
};

function App() {
  const path = usePathname();
  const Page = PAGES[path] ?? OverviewPage;
  return (
    <DashboardProvider>
      <AppShell>
        <Page />
      </AppShell>
    </DashboardProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
