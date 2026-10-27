import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite } from "../design/Hand";
import { clamp, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CountUp, CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 07 · What to watch — a seismograph strip runs under its pen: the trace is jagged, then settles as the
// voice says "fell", VIX ticking down to 18.39, and "no panic" is written under it. The camera drops to the
// desk: "watch" is written and three folders are laid down in order — the Fed's statement, then Google and
// Microsoft for Wednesday and Amazon for Thursday, under "the real tests of AI payback".
// "Volatility fell, so there's no panic. Watch the Fed's statement, then the real tests of AI payback:
//  Google and Microsoft on Wednesday, Amazon on Thursday."
const c = (w: string, nth = 0, off = 0) => cue(6, w, nth, off);

const mono: React.CSSProperties = { fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: INK };

// ── the seismograph ──
const STRIP = { x: 100, y: 300, w: 1620, h: 300 };
const PEN_X = 1420;
const SPEED = 6;
const MID = STRIP.y + STRIP.h / 2;

const amp = (t: number) => interpolate(t, [c("fell", 0, -16), c("panic", 0, 4)], [104, 12], clamp);
const wig = (t: number) => (Math.sin(t * 0.93) + 0.7 * Math.sin(t * 2.31 + 1.3) + 0.45 * Math.sin(t * 4.07 + 2.1) + 0.3 * Math.sin(t * 6.9 + 0.4)) / 2.45;

const Seismograph: React.FC = () => {
  const f = useF();
  const pts: string[] = [];
  for (let t = f - (PEN_X - STRIP.x) / SPEED; t <= f; t += 0.5) {
    pts.push(`${(PEN_X - (f - t) * SPEED).toFixed(1)},${(MID + wig(t) * amp(t)).toFixed(1)}`);
  }
  const penY = MID + wig(f) * amp(f);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: STRIP.x,
          top: STRIP.y,
          width: STRIP.w,
          height: STRIP.h,
          background: "#f6f1e4",
          backgroundImage: "linear-gradient(rgba(200,60,40,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(200,60,40,0.22) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          backgroundPosition: `${-(f * SPEED) % 60}px 0px`,
          boxShadow: "0 14px 22px rgba(40,24,8,0.22)",
        }}
      />
      <svg width={1920} height={800} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        <line x1={PEN_X} y1={penY} x2={PEN_X + 260} y2={STRIP.y - 70} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <circle cx={PEN_X} cy={penY} r={9} fill={SPOT} />
        <circle cx={PEN_X + 260} cy={STRIP.y - 70} r={16} fill={INK} />
      </svg>
      <div style={{ position: "absolute", left: STRIP.x + STRIP.w - 260, top: STRIP.y + 20, width: 230, padding: "10px 16px", background: CREAM, boxShadow: "0 4px 6px rgba(40,24,8,0.2)" }}>
        <div style={{ ...mono, fontSize: 20 }}>VIX</div>
        <div style={{ fontFamily: TABLOID, fontSize: 70, lineHeight: 1, color: INK }}>
          <CountUp at={c("fell", 0, -10)} dur={30} from={19.45} to={18.39} decimals={2} />
        </div>
        <div style={{ ...mono, fontSize: 22, color: SPOT }}>−5.45%</div>
      </div>
    </>
  );
};

// ── the folders ──
const Folder: React.FC<{ x: number; y: number; rot: number; at: number; tab: string; tabAt: number; children: React.ReactNode; note: string }> = ({ x, y, rot, at, tab, tabAt, children, note }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.15);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 620, height: 360, transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ position: "absolute", left: 24, top: -46, width: 280, height: 56, background: "#dcc084", borderRadius: "10px 10px 0 0", paddingLeft: 20, ...mono, fontSize: 22, lineHeight: "50px" }}>
        <TypeOn text={tab} at={tabAt} cps={36} caret={false} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#e3c98f", borderRadius: 6, boxShadow: "inset 0 -10px 18px rgba(120,80,20,0.18)" }} />
      <div style={{ position: "absolute", left: 36, top: 40, fontFamily: SERIF, fontWeight: 900, fontSize: 66, lineHeight: 1.05, letterSpacing: "-0.03em", color: INK }}>{children}</div>
      <div style={{ position: "absolute", left: 36, bottom: 30, ...mono, fontSize: 20, opacity: 0.75 }}>{note}</div>
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 520, s: 1.03 },
  { f: c("Volatility"), x: 960, y: 520, s: 1.02 },
  { f: c("panic", 0, 4), x: 960, y: 530, s: 1.0 },
  { f: c("Watch", 0, 6), x: 1100, y: 1130, s: 0.95 },
  { f: c("Thursday", 0, 30), x: 1110, y: 1135, s: 0.97 },
];

export const S7Watch: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Camera keys={KEYS}>
      <div style={{ position: "absolute", left: -400, top: -300, width: 3000, height: 2300 }}>
        <Paper />
      </div>

      {/* ── volatility ── */}
      <Abs x={110} y={100} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
        <TypeOn text="VOLATILITY · VIX" at={c("Volatility", 0, -6)} cps={44} />
      </Abs>
      <div style={{ position: "absolute", left: 100, top: 140, fontFamily: SERIF, fontWeight: 900, fontSize: 112, lineHeight: 1, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
        <CueWords words={[["Volatility", c("Volatility")], ["fell.", c("fell")]]} wordStyle={(i) => (i === 1 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
      </div>
      <Seismograph />
      <Handwrite text="no panic" at={c("no", 0, -2)} dur={14} size={120} rot={-5} underline style={{ left: 1040, top: 640 }} />

      {/* ── the week ── */}
      <Handwrite text="watch" at={c("Watch", 0, -4)} dur={12} size={110} rot={-6} underline style={{ left: 130, top: 850 }} />
      <div style={{ position: "absolute", left: 800, top: 880, fontFamily: SERIF, fontWeight: 900, fontSize: 64, lineHeight: 1, letterSpacing: "-0.03em", color: INK, whiteSpace: "nowrap" }}>
        <CueWords
          words={[["The", c("the", 1)], ["real", c("real")], ["tests", c("tests")], ["of", c("of")], ["AI", c("AI")], ["payback:", c("payback")]]}
          wordStyle={(i) => (i >= 4 ? { color: SPOT } : undefined)}
        />
      </div>
      <Folder x={110} y={1030} rot={-1.6} at={c("Fed's", 0, -6)} tab="FED" tabAt={c("Fed's", 0, -2)} note="POLICY STATEMENT">
        The Fed's
        <br />
        statement
      </Folder>
      <Folder x={790} y={1040} rot={1} at={c("Google", 0, -6)} tab="WEDNESDAY" tabAt={c("Wednesday", 0, -4)} note="EARNINGS · AFTER THE CLOSE">
        <CueWords words={[["Google", c("Google")]]} />
        <br />
        <CueWords words={[["Microsoft", c("Microsoft")]]} />
      </Folder>
      <Folder x={1470} y={1030} rot={-0.8} at={c("Amazon", 0, -6)} tab="THURSDAY" tabAt={c("Thursday", 0, -4)} note="EARNINGS · AFTER THE CLOSE">
        Amazon
      </Folder>
    </Camera>
  </AbsoluteFill>
);
