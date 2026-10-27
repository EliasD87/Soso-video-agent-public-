/**
 * fetch-market-data.mjs
 * Pulls real prices for the Scene 8 watchlist and writes src/marketData.json
 * (display-ready strings, so the component stays dumb).
 *
 *   BTC, XAUT  → CoinGecko free API (no key)
 *   USTECH-100 → Yahoo Finance ^NDX (no key)
 *   CL (WTI)   → Yahoo Finance CL=F (no key)
 *
 * Run:  node fetch-market-data.mjs
 * On any source failure the previous JSON is kept, so a flaky API never
 * breaks a render.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "src", "marketData.json");

const fmt = (n, { dollars = false, decimals = 0 } = {}) =>
  (dollars ? "$" : "") +
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const pct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

async function coingecko() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=usd&include_24hr_change=true",
  );
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  return res.json();
}

async function yahoo(symbol) {
  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  if (!res.ok) throw new Error(`yahoo ${symbol} ${res.status}`);
  const j = await res.json();
  const meta = j.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  // chartPreviousClose is the close BEFORE the 5-day window, so it gives a
  // 5-day change. The day change is against the second-to-last daily close.
  const closes = (j.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []).filter((c) => c != null);
  const prev = closes.length >= 2 ? closes[closes.length - 2] : meta?.previousClose;
  if (price == null || prev == null) throw new Error(`yahoo ${symbol}: no data`);
  return { price, changePct: ((price - prev) / prev) * 100 };
}

async function main() {
  const [cg, ndx, wti] = await Promise.all([coingecko(), yahoo("^NDX"), yahoo("CL=F")]);

  const btc = cg.bitcoin;
  const xaut = cg["tether-gold"];

  const assets = [
    {
      ticker: "USTECH-100",
      name: "US Tech Index",
      price: fmt(ndx.price),
      change: pct(ndx.changePct),
      up: ndx.changePct >= 0,
    },
    {
      ticker: "CL",
      name: "Crude Oil (WTI)",
      price: fmt(wti.price, { dollars: true, decimals: 2 }),
      change: pct(wti.changePct),
      up: wti.changePct >= 0,
    },
    {
      ticker: "XAUT",
      name: "Gold (Tether)",
      price: fmt(xaut.usd, { dollars: true }),
      change: pct(xaut.usd_24h_change),
      up: xaut.usd_24h_change >= 0,
    },
    {
      ticker: "BTC",
      name: "Bitcoin",
      price: fmt(btc.usd, { dollars: true }),
      change: pct(btc.usd_24h_change),
      up: btc.usd_24h_change >= 0,
    },
  ];

  const out = { fetchedAt: new Date().toISOString(), assets };
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`written ${OUT} (fetched ${out.fetchedAt})`);
  for (const a of assets) console.log(`  ${a.ticker.padEnd(11)} ${a.price.padStart(10)}  ${a.change}`);
}

main().catch((e) => {
  // Keep the previous JSON on failure — a flaky API must never block a render.
  console.error("fetch failed:", e.message);
  try {
    const prev = JSON.parse(readFileSync(OUT, "utf8"));
    console.error(`keeping previous data from ${prev.fetchedAt}`);
  } catch {
    console.error("and no previous marketData.json exists — create one manually");
    process.exitCode = 1;
  }
});
