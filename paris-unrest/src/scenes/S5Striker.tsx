import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, MarkerLoop, Scrawl, Tape } from "../design/Hand";
import { clamp, EASE, IN, OUT, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CountUp, CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 05 · Crypto — a fairground high striker priced in Bitcoin: the puck shoots up the board, rings the brass
// bell at $83K (the one full-colour object), and drops back to rest near $82K. Ether's price is hung on as
// a paper tag. The camera moves to the fund flows: two printed arrows run out of the fund cards, and the
// ether arrow is the fatter one — bigger outflows than Bitcoin's.
// "Bitcoin briefly touched eighty-three thousand and sits near eighty-two. Ether is near twenty-four hundred,
//  and ether funds saw bigger outflows than Bitcoin funds."
const c = (w: string, nth = 0, off = 0) => cue(4, w, nth, off);

// the striker board: 100px per $1K, $78K at the base
const B = { x: 1330, w: 200, top: 330, base: 900 };
const yOf = (k: number) => 880 - (k - 78) * 100;

const BlockArrow: React.FC<{ x: number; y: number; len: number; thick: number; progress: number }> = ({ x, y, len, thick, progress }) => {
  const head = thick * 1.25;
  const hw = thick * 1.05;
  const d = `M0,${hw - thick / 2} H${len - head} V0 L${len},${hw} L${len - head},${2 * hw} V${hw + thick / 2} H0 Z`;
  return (
    <svg width={len} height={2 * hw} style={{ position: "absolute", left: x, top: y - hw, overflow: "visible", clipPath: `inset(-10% ${(1 - progress) * 100}% -10% -2%)` }}>
      <path d={d} fill={SPOT} style={{ filter: "url(#marker-rough)" }} />
    </svg>
  );
};

const FundCard: React.FC<{ x: number; y: number; name: string; at: number; rot: number }> = ({ x, y, name, at, rot }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.25);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 470, height: 160, background: "#fbf8ef", borderLeft: `14px solid ${INK}`, transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ position: "absolute", left: 30, top: 22, fontFamily: TABLOID, fontSize: 70, lineHeight: 1, letterSpacing: "0.04em", color: INK }}>{name}</div>
      <div style={{ position: "absolute", left: 32, top: 108, fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: INK, opacity: 0.7 }}>SPOT ETFs · WEEKLY FLOW</div>
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 480, s: 1.06 },
  { f: c("touched", 0, 0), x: 980, y: 470, s: 1.02 },
  { f: c("eighty-two", 0, 8), x: 960, y: 500, s: 1.0 },
  { f: c("and", 1, -12), x: 960, y: 500, s: 1.0 },
  { f: c("and", 1, 8), x: 2960, y: 545, s: 1.0 },
  { f: c("funds", 1, 30), x: 2965, y: 548, s: 1.03 },
];

export const S5Striker: React.FC = () => {
  const f = useF();
  const hit = c("touched", 0, 0);
  // the puck: up the board on "briefly", rings the bell, falls back to rest near $82K
  const up = interpolate(f, [c("briefly", 0, -2), hit], [yOf(78.2), yOf(83)], { ...clamp, easing: IN });
  const fall = interpolate(f, [hit + 3, hit + 15], [yOf(83), yOf(82)], { ...clamp, easing: IN });
  const land = hit + 15;
  const bounce = f > land ? Math.abs(Math.sin((f - land) / 3)) * 26 * Math.exp(-(f - land) / 6) : 0;
  const py = f < hit + 3 ? up : fall - bounce;
  const ring = f >= hit ? Math.sin((f - hit) * 1.3) * 9 * Math.exp(-(f - hit) / 12) : 0;
  const burst = f >= hit ? prog(f, hit, hit + 8, OUT) : 0;
  const burstFade = 1 - prog(f, hit + 6, hit + 16);
  const tag = slap(f, c("Ether", 0, -4), -5, 1.3);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -300, top: -300, width: 4600, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the high striker ── */}
        <Abs x={100} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="BITCOIN · TEST OF STRENGTH" at={c("Bitcoin")} cps={40} />
        </Abs>
        <Abs x={92} y={160} w={1120} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 124, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["Briefly", c("briefly")], ["touched", c("touched")], ["$83K.", c("eighty-three")]]} gap="0.22em" wordStyle={(i) => (i === 2 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>
        <Scrawl text="now sits ~$82K" at={c("sits", 0, -2)} dur={16} size={64} rot={-4} color={INK} style={{ left: 104, top: 440 }} />

        {/* the board */}
        <div style={{ position: "absolute", left: B.x, top: B.top, width: B.w, height: B.base - B.top, background: `repeating-linear-gradient(90deg, ${CREAM} 0 40px, #f2d4c8 40px 80px)`, boxShadow: "0 16px 24px rgba(40,24,8,0.3)", border: `6px solid ${INK}`, boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: B.x + B.w / 2 - 3, top: B.top, width: 6, height: B.base - B.top, background: "#6e6a62" }} />
        {[78, 79, 80, 81, 82, 83].map((k) => (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: B.x + B.w, top: yOf(k) - 2, width: 34, height: 5, background: INK }} />
            <div style={{ position: "absolute", left: B.x + B.w + 46, top: yOf(k) - 22, fontFamily: MONO, fontWeight: 600, fontSize: 34, color: k === 83 ? SPOT : INK }}>{`$${k}K`}</div>
            {k < 83 ? <div style={{ position: "absolute", left: B.x + B.w, top: yOf(k + 0.5) - 1, width: 18, height: 3, background: INK }} /> : null}
          </React.Fragment>
        ))}
        {/* the plinth and the pad */}
        <div style={{ position: "absolute", left: B.x - 70, top: B.base - 6, width: B.w + 140, height: 70, background: INK, borderRadius: 6, boxShadow: "0 12px 16px rgba(40,24,8,0.3)" }} />
        <div style={{ position: "absolute", left: B.x - 40, top: B.base - 26, width: 90, height: 26, background: SPOT, borderRadius: "6px 6px 0 0", transform: `scaleY(${f >= c("briefly", 0, -4) && f < c("briefly", 0, 2) ? 0.5 : 1})`, transformOrigin: "50% 100%" }} />
        {/* the bell: full colour */}
        <Img src={staticFile("scenes/bell.png")} style={{ position: "absolute", left: B.x + B.w / 2 - 125, top: B.top - 330, width: 250, transformOrigin: "50% 70%", transform: `rotate(${ring}deg)`, filter: "drop-shadow(0 14px 14px rgba(40,24,8,0.35))" }} />
        {burst > 0 && burstFade > 0 ? (
          <svg width={420} height={420} viewBox="-210 -210 420 420" style={{ position: "absolute", left: B.x + B.w / 2 - 210, top: B.top - 330 + 90 - 210, opacity: burstFade, overflow: "visible" }}>
            {[...Array(10)].map((_, k) => {
              const a = Math.PI * (0.95 + (k / 9) * 1.1);
              const r0 = 120 + burst * 20;
              const r1 = 150 + burst * 60 + (k % 2) * 16;
              return <line key={k} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={SPOT} strokeWidth={8} strokeLinecap="round" />;
            })}
          </svg>
        ) : null}
        <Handwrite text="DING!" at={hit} dur={8} size={96} rot={-8} style={{ left: 1610, top: 70 }} />
        {/* the puck */}
        <div style={{ position: "absolute", left: B.x + B.w / 2 - 50, top: py - 50, width: 100, height: 100, borderRadius: 50, background: SPOT, border: `6px solid ${INK}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TABLOID, fontSize: 32, color: CREAM, letterSpacing: "0.04em", boxShadow: "0 8px 12px rgba(40,24,8,0.35)" }}>
          BTC
        </div>

        {/* ether, hung on as a tag */}
        {tag.visible ? (
          <div style={{ position: "absolute", left: 160, top: 600, width: 560, padding: "26px 40px 24px 90px", background: "#fbf8ef", transform: tag.transform, opacity: tag.opacity, filter: tag.filter, clipPath: "polygon(12% 0%, 100% 0%, 100% 100%, 12% 100%, 0% 50%)" }}>
            <div style={{ position: "absolute", left: 38, top: "50%", width: 26, height: 26, marginTop: -13, borderRadius: 13, background: "#d8cdb6", boxShadow: "inset 0 2px 3px rgba(0,0,0,0.3)" }} />
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", color: INK }}>ETHER · NEAR</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: "-0.04em", color: INK, marginTop: 6 }}>
              <CountUp at={c("twenty-four", 0, -4)} dur={16} from={2300} to={2406} prefix="$" comma />
            </div>
          </div>
        ) : null}
        <svg width={260} height={120} style={{ position: "absolute", left: 30, top: 560, overflow: "visible", opacity: tag.visible ? 1 : 0 }}>
          <path d="M20,0 C60,40 120,70 180,104" fill="none" stroke="#8a7a5c" strokeWidth={4} />
        </svg>

        {/* ── the fund flows ── */}
        <Abs x={2080} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="CRYPTO FUNDS · OUTFLOWS THIS WEEK" at={c("and", 1, -4)} cps={44} />
        </Abs>
        <Abs x={2072} y={160} w={1320} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 108, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["Ether", c("ether", 1)], ["funds", c("funds")], ["saw", c("saw")], ["bigger", c("bigger")], ["outflows.", c("outflows")]]} gap="0.22em" wordStyle={(i) => (i === 3 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>
        <FundCard x={2120} y={470} name="ETHER" at={c("ether", 1, -2)} rot={-1.5} />
        <FundCard x={2120} y={730} name="BITCOIN" at={c("than", 0, -4)} rot={1.2} />
        <BlockArrow x={2610} y={550} len={680} thick={70} progress={prog(f, c("saw", 0, -2), c("outflows", 0, 6), EASE)} />
        <BlockArrow x={2610} y={810} len={540} thick={50} progress={prog(f, c("Bitcoin", 1, -2), c("funds", 1, 6), EASE)} />
        <Abs x={3326} y={482} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 108, lineHeight: 1, letterSpacing: "-0.04em", color: SPOT, filter: "url(#ink)", opacity: f >= c("outflows", 0, -4) ? 1 : 0 }}>
          <CountUp at={c("outflows", 0, -4)} dur={16} from={0} to={320} prefix="−$" suffix="M" />
        </Abs>
        <Abs x={3190} y={752} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", opacity: f >= c("funds", 1, -4) ? 1 : 0 }}>
          <CountUp at={c("funds", 1, -4)} dur={14} from={0} to={228} prefix="−$" suffix="M" />
        </Abs>
        <MarkerLoop w={420} h={170} seed="eth320" stroke={8} progress={prog(f, c("bigger", 0, -2), c("outflows", 0, 14), OUT)} style={{ left: 3290, top: 452 }} />
        <Tape x={2240} y={452} rot={-6} w={140} h={42} opacity={prog(f, c("ether", 1, 4), c("ether", 1, 6))} />
      </Camera>
    </AbsoluteFill>
  );
};
