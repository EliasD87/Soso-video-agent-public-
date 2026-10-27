import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath } from "../design/Hand";
import { boil, OUT, pop, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CountUp, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 04 · Crypto — the Bitcoin coin lands and $80K counts up beside it, "sits near" written over it. Two
// price tags drop on strings from a rail: SPOT $79,864, then CME FUTURES $79,900, hanging a notch higher;
// a dashed line off the spot tag shows the gap, "+0.05%", and "just above" is written under them. Then a
// ledger page for Friday's flows: Bitcoin funds −$140M in red, USDC and USDT supply each a little lower,
// and "slipped" underlined.
// "Bitcoin sits near eighty thousand, with CME futures just above spot. But Bitcoin funds lost a hundred
//  and forty million on Friday, and stablecoin supply slipped."
const c = (w: string, nth = 0, off = 0) => cue(3, w, nth, off);

const mono: React.CSSProperties = { fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: INK };

// ── price tags on strings ──
const RAIL_Y = 210;
const PriceTag: React.FC<{ x: number; y: number; at: number; label: string; price: string; seed: number }> = ({ x, y, at, label, price, seed }) => {
  const f = useF();
  if (f < at) return null;
  const p = pop(f, at, 10, 130, 0.8);
  const yy = y - (1 - p) * 260;
  const t = f - at;
  const swing = Math.sin(t * 0.22 + seed) * 5 * Math.exp(-t / 26);
  const W = 330;
  return (
    <>
      <div style={{ position: "absolute", left: x + W / 2 - 1.5, top: RAIL_Y, width: 3, height: yy - RAIL_Y + 30, background: "rgba(25,23,20,0.75)" }} />
      <div
        style={{
          position: "absolute",
          left: x,
          top: yy,
          width: W,
          height: 300,
          transformOrigin: "50% 30px",
          transform: `rotate(${swing}deg)`,
          opacity: Math.min(1, (f - at + 1) / 3),
          filter: "drop-shadow(0 12px 14px rgba(40,24,8,0.28))",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "#f4e6c4", clipPath: "polygon(22% 0, 78% 0, 100% 16%, 100% 100%, 0 100%, 0 16%)" }} />
        <div style={{ position: "absolute", left: W / 2 - 14, top: 16, width: 28, height: 28, borderRadius: 14, background: "#cdbf9c", boxShadow: "inset 0 2px 3px rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 78, textAlign: "center", ...mono, fontSize: 22 }}>{label}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: TABLOID, fontSize: 92, lineHeight: 1, color: INK }}>{price}</div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 236, height: 2, background: "rgba(25,23,20,0.3)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 248, textAlign: "center", ...mono, fontSize: 18, opacity: 0.7 }}>BTC · USD</div>
      </div>
    </>
  );
};

// ── the flows ledger ──
const LEDGER = { x: 2800, y: 150, w: 1060, h: 760 };
const Row: React.FC<{ y: number; label: string; at: number; amount: string; amountAt: number; red?: boolean; note?: string }> = ({ y, label, at, amount, amountAt, red, note }) => {
  const f = useF();
  return (
    <>
      <div style={{ position: "absolute", left: 40, top: y, fontFamily: SERIF, fontWeight: 900, fontSize: 52, letterSpacing: "-0.02em", color: INK }}>
        <TypeOn text={label} at={at} cps={34} caret={false} style={{ fontFamily: SERIF }} />
      </div>
      <Handwrite text={amount} at={amountAt} dur={12} size={red ? 92 : 70} halo={null} color={red ? SPOT : INK} rot={-3} style={{ left: 600, top: y - (red ? 18 : 6) }} />
      {note ? (
        <div style={{ position: "absolute", left: 610, top: y + 72, ...mono, fontSize: 22, color: SPOT, opacity: prog(f, amountAt + 6, amountAt + 12) }}>{note}</div>
      ) : null}
    </>
  );
};

const Ledger: React.FC = () => {
  const f = useF();
  const s = slap(f, c("Bitcoin", 1, -8), 1.2, 1.12);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: LEDGER.x, top: LEDGER.y, width: LEDGER.w, height: LEDGER.h, background: "#eef1e2", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 130 + i * 84, height: 2, background: "rgba(60,110,140,0.28)" }} />
      ))}
      <div style={{ position: "absolute", left: 560, top: 0, bottom: 0, width: 2, background: "rgba(200,60,40,0.45)" }} />
      <div style={{ position: "absolute", left: 568, top: 0, bottom: 0, width: 2, background: "rgba(200,60,40,0.45)" }} />
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: TABLOID, fontSize: 62, lineHeight: 1, letterSpacing: "0.04em", color: INK }}>FLOWS</div>
      <div style={{ position: "absolute", right: 40, top: 48, ...mono }}>FRI · OCT 23</div>
      <Row y={160} label="Bitcoin funds" at={c("Bitcoin", 1, -4)} amount="−$140M" amountAt={c("lost", 0, -2)} red />
      <Row y={330} label="USDC supply" at={c("stablecoin", 0, -6)} amount="$71.66B" amountAt={c("supply", 0, -6)} note="−0.11%" />
      <Row y={480} label="USDT supply" at={c("stablecoin", 0, 0)} amount="$182.22B" amountAt={c("supply", 0, 0)} note="−0.10%" />
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 900, y: 540, s: 1.04 },
  { f: c("Bitcoin"), x: 900, y: 540, s: 1.02 },
  { f: c("thousand", 0, 0), x: 920, y: 540, s: 1.0 },
  { f: c("CME", 0, 0), x: 1540, y: 520, s: 1.0 },
  { f: c("spot", 0, -2), x: 1560, y: 520, s: 1.0 },
  { f: c("But", 0, 8), x: 3330, y: 540, s: 1.0 },
  { f: c("slipped", 0, 40), x: 3340, y: 545, s: 1.01 },
];

export const S4Crypto: React.FC = () => {
  const f = useF();
  const coin = slap(f, c("Bitcoin", 0, -6), -6, 1.3);
  const cb = boil(f, "coin", 0.7);
  const gap = prog(f, c("just", 0, -4), c("above", 0, 4), OUT);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -400, top: -300, width: 4900, height: 1700 }}>
          <Paper />
        </div>

        {/* ── Bitcoin ── */}
        <Abs x={110} y={104} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="CRYPTO · BITCOIN" at={c("Bitcoin", 0, -6)} cps={44} />
        </Abs>
        {coin.visible ? (
          <Img src={staticFile("scenes/coin.png")} style={{ position: "absolute", left: 120 + cb.x, top: 230 + cb.y, width: 420, transform: coin.transform, opacity: coin.opacity, filter: coin.filter }} />
        ) : null}
        <Abs x={590} y={290} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 300, lineHeight: 1, letterSpacing: "-0.05em", color: INK, opacity: prog(f, c("eighty", 0, -6), c("eighty", 0, -2)) }}>
          <CountUp at={c("eighty", 0, -4)} dur={c("thousand", 0, 10) - c("eighty", 0, -4)} from={60} to={80} prefix="$" suffix="K" />
        </Abs>
        <Handwrite text="sits near" at={c("sits", 0, -2)} dur={14} size={86} rot={-5} style={{ left: 640, top: 196 }} />

        {/* ── spot vs CME ── */}
        <div style={{ position: "absolute", left: 1400, top: RAIL_Y - 8, width: 880, height: 12, background: INK, borderRadius: 6, boxShadow: "0 6px 8px rgba(40,24,8,0.25)", opacity: prog(f, c("with", 0, -8), c("with", 0, -2)) }} />
        <PriceTag x={1460} y={440} at={c("with", 0, -2)} label="SPOT" price="$79,864" seed={0} />
        <PriceTag x={1880} y={400} at={c("CME", 0, -2)} label="CME FUTURES" price="$79,900" seed={2} />
        <div style={{ position: "absolute", left: 1460, top: 438, width: 760 * gap, height: 0, borderTop: `4px dashed ${SPOT}` }} />
        <InkPath d="M0,0 C16,8 16,34 0,42" w={16} h={42} stroke={6} progress={prog(f, c("above", 0, -2), c("above", 0, 8), OUT)} style={{ left: 2224, top: 398 }} />
        <Abs x={2250} y={380} style={{ fontFamily: TABLOID, fontSize: 52, lineHeight: 1, color: SPOT, opacity: prog(f, c("above", 0, 4), c("above", 0, 10)) }}>
          +0.05%
        </Abs>
        <Handwrite text="just above spot" at={c("just", 0, -2)} dur={16} size={84} rot={-4} underline style={{ left: 1500, top: 790 }} />

        {/* ── the flows ── */}
        <Ledger />
        <Handwrite text="slipped" at={c("slipped", 0, -2)} dur={12} size={112} rot={-6} underline style={{ left: 2890, top: 740 }} />
      </Camera>
    </AbsoluteFill>
  );
};
