// Captures review screenshots + the one-pager PDF from a running server.
// usage: node scripts/shots.mjs http://localhost:3100 ./deliverables
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "./deliverables";
fs.mkdirSync(out, { recursive: true });
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});

async function shot(page, path, file, full = true) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${file}`, fullPage: full });
}

const desk = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await shot(desk, "/", "1-overview.png");
// creative page with a custom rule to show the live recalculation
await desk.goto(base + "/creatives", { waitUntil: "networkidle" });
await desk.getByRole("button", { name: "Increase minimum ROAS" }).click();
await desk.getByRole("button", { name: "Increase minimum ROAS" }).click();
await desk.getByRole("button", { name: "Increase minimum ROAS" }).click();
await desk.waitForTimeout(900);
await desk.screenshot({ path: `${out}/2-creative-team.png`, fullPage: true });
await desk.getByRole("button", { name: "Reset" }).click();
await shot(desk, "/insights", "3-angles-insights.png");
await shot(desk, "/about", "4-data-plan.png");
// dialog
await desk.goto(base + "/creatives", { waitUntil: "networkidle" });
await desk.locator("tbody tr").nth(5).click();
await desk.waitForTimeout(900);
await desk.screenshot({ path: `${out}/x-creative-dialog.png` });

const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await shot(mob, "/", "m-overview.png");
await shot(mob, "/creatives", "m-creatives.png");
await shot(mob, "/insights", "m-insights.png");
const sw = await mob.evaluate(() => document.documentElement.scrollWidth);
console.log("mobile scrollWidth", sw);

const pdf = await browser.newPage();
await pdf.goto(base + "/about", { waitUntil: "networkidle" });
await pdf.emulateMedia({ media: "print" });
await pdf.pdf({ path: `${out}/data-plan-one-pager.pdf`, format: "A4", printBackground: true, pageRanges: "" });
await browser.close();
