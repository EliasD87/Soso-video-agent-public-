import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, Scrawl } from "../design/Hand";
import { clamp, EASE, IN, OUT, pop, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { FRAKTUR, INK, MONO, SERIF, SPOT } from "../design/tokens";
import { cue } from "../cues";

// 03 · China — the quarter's report card: growth gets its grade written in, BEAT FORECASTS and a gold
// star; then the two red crosses, investment and property. Beside it a half-built tower sinks into the
// ground by more than a quarter of its height. The camera moves to the sea bed of policy rates: the
// central bank's anchor is lifted out of the 7-day berth and dropped into the cheaper overnight one.
// "China's economy beat forecasts, growing four and a half percent. But investment fell almost ten
//  percent, and property sank more than a quarter. The central bank re-anchored to a cheaper overnight rate."
const c = (w: string, nth = 0, off = 0) => cue(2, w, nth, off);

const CARD = { x: 100, y: 110, w: 1000, h: 830 };

const Row: React.FC<{ y: number; label: string; sub: string; at: number }> = ({ y, label, sub, at }) => {
  const f = useF();
  const o = prog(f, at - 6, at);
  return (
    <>
      <div style={{ position: "absolute", left: 50, top: y, fontFamily: MONO, fontWeight: 600, fontSize: 30, letterSpacing: "0.14em", color: INK, opacity: o }}>{label}</div>
      <div style={{ position: "absolute", left: 50, top: y + 42, fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: "0.12em", color: INK, opacity: o * 0.6 }}>{sub}</div>
      <div style={{ position: "absolute", left: 40, right: 40, top: y + 150, height: 2, background: INK, opacity: 0.35 * o }} />
    </>
  );
};

const Star: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useF();
  const s = slap(f, at, 12, 1.6);
  if (!s.visible) return null;
  const pts = [...Array(10)].map((_, i) => {
    const r = i % 2 ? 38 : 92;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return `${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`;
  });
  return (
    <svg width={200} height={200} viewBox="0 0 200 200" style={{ position: "absolute", left: x, top: y, transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.45" stopColor="#f2c43c" />
          <stop offset="1" stopColor="#b9831a" />
        </linearGradient>
      </defs>
      <polygon points={pts.join(" ")} fill="url(#gold)" stroke="#fbf6e6" strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};

const Cross: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useF();
  return (
    <InkPath d="M0,0 C30,34 60,70 96,104 M94,0 C64,30 34,66 2,106" w={96} h={106} stroke={14} progress={prog(f, at, at + 8, OUT)} style={{ left: x, top: y }} />
  );
};

// sea bed of policy rates: 4px per basis point
const BED = { x0: 2120, x1: 3780, step: 2900, hi: 780, lo: 840 };

const KEYS: CamKey[] = [
  { f: -12, x: 620, y: 540, s: 1.12 },
  { f: c("But", 0, 0), x: 620, y: 545, s: 1.1 },
  { f: c("property", 0, -12), x: 620, y: 545, s: 1.1 },
  { f: c("property", 0, 8), x: 975, y: 540, s: 1.0 },
  { f: c("The", 0, -14), x: 975, y: 540, s: 1.0 },
  { f: c("The", 0, 8), x: 2950, y: 555, s: 1.0 },
  { f: c("rate", 0, 30), x: 2955, y: 560, s: 1.03 },
];

export const S3China: React.FC = () => {
  const f = useF();
  // the tower: rises out of the ground, then sinks by 27%
  const TW = 430;
  const TH = Math.round((TW * 1898) / 1000);
  const rise = pop(f, c("property", 0, -8), 14, 120, 0.9);
  const sink = prog(f, c("sank", 0, -2), c("quarter", 0, 6), EASE) * TH * 0.27;
  const GROUND = 900;
  const towerTop = GROUND - TH + (1 - rise) * (TH + 40) + sink;

  // the anchor: rests on the 7-day berth, lifted on "re-anchored", carried right, dropped on the overnight one
  const AW = 250;
  const AH = Math.round((AW * 1200) / 900);
  const lift = prog(f, c("re-anchored", 0, -4), c("re-anchored", 0, 10), OUT);
  const carry = prog(f, c("re-anchored", 0, 8), c("cheaper", 0, 4), EASE);
  const drop = prog(f, c("cheaper", 0, 2), c("overnight", 0, 0), IN);
  const landed = f >= c("overnight", 0, 0);
  const bounce = landed ? Math.sin(Math.min(1, (f - c("overnight", 0, 0)) / 7) * Math.PI) * 14 * Math.exp(-(f - c("overnight", 0, 0)) / 9) : 0;
  const ax = interpolate(carry, [0, 1], [2480, 3260]);
  const restHi = BED.hi - AH + 18;
  const restLo = BED.lo - AH + 18;
  const ay = landed ? restLo - bounce : interpolate(drop, [0, 1], [restHi - 120 * lift, restLo], clamp);
  const swing = (carry > 0 && carry < 1 ? Math.sin(carry * Math.PI) * -12 : 0) + (landed ? Math.sin((f - c("overnight", 0, 0)) / 3) * 4 * Math.exp(-(f - c("overnight", 0, 0)) / 12) : 0);
  const ring = { x: ax + AW * 0.53, y: ay + AH * 0.07 };
  const top = { x: 4600, y: -200 };
  const dust = landed ? prog(f, c("overnight", 0, 0), c("overnight", 0, 14), OUT) : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -300, top: -300, width: 4600, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the report card ── */}
        {(() => {
          const s = slap(f, -22, -1.2, 1.1);
          return (
            <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: "#f7f1df", transform: s.transform, boxShadow: "0 18px 28px rgba(40,24,8,0.26), 0 2px 3px rgba(40,24,8,0.2)" }}>
              <div style={{ position: "absolute", left: 18, top: 18, right: 18, bottom: 18, border: `3px solid ${INK}` }} />
              <div style={{ position: "absolute", left: 50, top: 46, fontFamily: FRAKTUR, fontSize: 84, color: INK, lineHeight: 1 }}>Report Card</div>
              <div style={{ position: "absolute", right: 50, top: 58, textAlign: "right", fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.18em", color: INK }}>
                <TypeOn text="CHINA · Q3" at={c("China's", 0, -2)} cps={30} />
              </div>
              <div style={{ position: "absolute", left: 40, right: 40, top: 160, height: 5, background: INK }} />
              <Row y={196} label="ECONOMY · GROWTH" sub="Q3 · YEAR ON YEAR" at={c("economy", 0, 0)} />
              <Row y={400} label="INVESTMENT" sub="SEPTEMBER · FIXED ASSETS" at={c("investment", 0, -2)} />
              <Row y={604} label="PROPERTY INVESTMENT" sub="YEAR ON YEAR" at={c("property", 0, -2)} />
              <Scrawl text="4.5%" at={c("four", 0, -2)} dur={14} size={120} color={INK} rot={-4} style={{ left: 520, top: 196 }} />
              <Handwrite text="beat forecasts" at={c("beat", 0, -2)} dur={14} size={50} rot={-4} halo={null} style={{ left: 380, top: 300 }} />
              <Star at={c("forecasts", 0, 6)} x={840} y={110} />
              <Scrawl text="−9.7%" at={c("fell", 0, -2)} dur={14} size={110} color={SPOT} rot={-3} style={{ left: 500, top: 410 }} />
              <Cross at={c("ten", 0, 6)} x={860} y={420} />
              <Scrawl text="−27.2%" at={c("sank", 0, -2)} dur={14} size={110} color={SPOT} rot={-3} style={{ left: 430, top: 650 }} />
              <Cross at={c("quarter", 0, 4)} x={860} y={640} />
            </div>
          );
        })()}

        {/* ── the tower sinks ── */}
        {sink > 4 ? (
          <div style={{ position: "absolute", left: 1290, top: GROUND - TH, width: TW - 100, height: 16, borderTop: `4px dashed ${INK}`, opacity: 0.5 }} />
        ) : null}
        <Img src={staticFile("scenes/tower.png")} style={{ position: "absolute", left: 1250, top: towerTop, width: TW, filter: "drop-shadow(0 10px 14px rgba(40,24,8,0.25))" }} />
        {/* the ground it sinks into */}
        <div style={{ position: "absolute", left: 1120, top: GROUND - 6, width: 820, height: 420, background: "#d9cdb2", clipPath: "polygon(0% 3%, 8% 0.5%, 17% 2.5%, 29% 0%, 41% 2%, 52% 0.4%, 64% 2.6%, 77% 0.6%, 88% 2.2%, 100% 0.8%, 100% 100%, 0% 100%)", boxShadow: "0 -4px 10px rgba(40,24,8,0.2)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(-35deg, rgba(25,23,20,0.13) 0 3px, transparent 3px 14px)" }} />
        </div>
        {sink > 4 ? (
          <InkPath d={`M0,0 L0,${(TH * 0.27).toFixed(0)}`} w={6} h={TH * 0.27} stroke={8} head progress={prog(f, c("sank", 0, 2), c("quarter", 0, 8), OUT)} style={{ left: 1730, top: GROUND - TH + 8 }} />
        ) : null}
        <Handwrite text="−27%" at={c("quarter", 0, -2)} dur={12} size={92} rot={-6} style={{ left: 1690, top: GROUND - TH + 250 }} />

        {/* ── the anchor: re-anchored to a cheaper overnight rate ── */}
        <Abs x={2080} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="PBOC · POLICY RATE" at={c("The", 0, -2)} cps={36} />
        </Abs>
        <Abs x={2072} y={160} w={1200} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["The", c("The")], ["central", c("central")], ["bank", c("bank")], ["re-anchored.", c("re-anchored")]]} gap="0.22em" wordStyle={(i) => (i === 3 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>

        {/* the sea bed, stepped down 15bp */}
        <svg width={1800} height={360} style={{ position: "absolute", left: BED.x0 - 40, top: BED.hi - 20, overflow: "visible" }}>
          <defs>
            <pattern id="bedHatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
              <rect width="3" height="14" fill="rgba(25,23,20,0.28)" />
            </pattern>
          </defs>
          <path d={`M40,20 H${BED.step - BED.x0 + 40} V${BED.lo - BED.hi + 20} H${BED.x1 - BED.x0 + 40} V300 H40 Z`} fill="url(#bedHatch)" />
          <path d={`M40,20 H${BED.step - BED.x0 + 40} V${BED.lo - BED.hi + 20} H${BED.x1 - BED.x0 + 40}`} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </svg>
        <Abs x={2160} y={BED.hi + 34} style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: "0.14em", color: INK, background: "rgba(235,228,212,0.92)", padding: "4px 10px" }}>
          7-DAY REPO · <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, letterSpacing: "-0.02em" }}>1.40%</span>
        </Abs>
        <Abs x={3000} y={BED.lo + 34} style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: "0.14em", color: INK, background: "rgba(235,228,212,0.92)", padding: "4px 10px", opacity: prog(f, c("overnight", 0, -6), c("overnight", 0, 0)) }}>
          OVERNIGHT REPO · <span style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 40, letterSpacing: "-0.02em", color: SPOT }}>1.25%</span>
        </Abs>
        <Handwrite text="−15bp" at={c("rate", 0, -2)} dur={12} size={72} rot={-6} style={{ left: 2930, top: 690 }} />

        {/* rope and anchor */}
        <svg width={4000} height={1400} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
          <path d={`M${top.x},${top.y} Q${(top.x + ring.x) / 2},${(top.y + ring.y) / 2 + 90} ${ring.x},${ring.y}`} fill="none" stroke="#7a6446" strokeWidth={12} strokeLinecap="round" />
          <path d={`M${top.x},${top.y} Q${(top.x + ring.x) / 2},${(top.y + ring.y) / 2 + 90} ${ring.x},${ring.y}`} fill="none" stroke="#a88c62" strokeWidth={5} strokeDasharray="9 9" />
        </svg>
        <Img src={staticFile("scenes/anchor.png")} style={{ position: "absolute", left: ax, top: ay, width: AW, transformOrigin: "53% 7%", transform: `rotate(${swing}deg)`, filter: "drop-shadow(0 14px 12px rgba(40,24,8,0.3))" }} />
        {dust > 0 && dust < 1 ? (
          <svg width={400} height={120} viewBox="-200 -100 400 120" style={{ position: "absolute", left: ax + AW / 2 - 200, top: BED.lo - 100, overflow: "visible", opacity: 1 - dust }}>
            {[...Array(8)].map((_, k) => {
              const dir = k < 4 ? -1 : 1;
              const d = 30 + dust * (60 + (k % 4) * 30);
              return <circle key={k} cx={dir * d} cy={-10 - (k % 4) * 12 * dust} r={8 + (k % 3) * 4} fill={INK} opacity={0.5} />;
            })}
          </svg>
        ) : null}
        <Scrawl text="cheaper" at={c("cheaper", 0, -2)} dur={12} size={76} rot={-6} style={{ left: 3540, top: 640 }} />
      </Camera>
    </AbsoluteFill>
  );
};
