import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, Highlight, InkPath } from "../design/Hand";
import { EASE, OUT, prog, slap, useF } from "../design/motion";
import { CountUp, CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, DARK, INK, MONO, SERIF, SPOT } from "../design/tokens";
import { cue } from "../cues";

// 06 · Trade setup — the black ink page. The thesis is written UNCHANGED. An agenda card headed THE DEBATE
// lands with chip scarcity as item 1; on "whether AI pays off" the two items trade places, the new item 1
// is highlighted and "chip scarcity" is struck out on "not". The camera drops down the page: the 10-year
// counts up to 4.98%, "near 5%" is written, and a staircase of rate hikes is drawn up the page for the new
// hiking cycle the markets now price.
// "So the thesis is unchanged: the debate is now whether AI pays off, not chip scarcity. The ten-year sits
//  near five percent, as markets price a new hiking cycle."
const c = (w: string, nth = 0, off = 0) => cue(5, w, nth, off);

const AG = { x: 110, y: 330, w: 1260, h: 500 };
const SLOT = [150, 320];

const Agenda: React.FC = () => {
  const f = useF();
  const s = slap(f, c("debate", 0, -6), -1.2, 1.15);
  if (!s.visible) return null;
  const sw = prog(f, c("whether", 0, -6), c("whether", 0, 10), EASE);
  const arc = Math.sin(Math.PI * sw);
  const item = (text: string, from: number, to: number, dx: number, style?: React.CSSProperties) => (
    <div style={{ position: "absolute", left: 140 + arc * dx, top: SLOT[from] + (SLOT[to] - SLOT[from]) * sw, fontFamily: SERIF, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: "-0.035em", color: INK, whiteSpace: "nowrap", ...style }}>
      {text}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: AG.x, top: AG.y, width: AG.w, height: AG.h, background: "#f4efe2", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 84, height: 3, background: SPOT, opacity: 0.7 }} />
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 250 + i * 84, height: 2, background: "rgba(60,110,140,0.22)" }} />
      ))}
      <div style={{ position: "absolute", left: 40, top: 30, fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: "0.18em", color: INK }}>THE DEBATE</div>
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: 40, top: SLOT[i] + 4, fontFamily: SERIF, fontWeight: 900, fontSize: 84, lineHeight: 1, color: SPOT }}>
          {i + 1}.
        </div>
      ))}
      <Highlight w={1000} h={84} progress={prog(f, c("pays", 0, -2), c("off", 0, 8), OUT)} style={{ left: 130, top: SLOT[0] + 16 }} />
      {item("Chip scarcity", 0, 1, 70, { opacity: 1 - 0.35 * prog(f, c("not", 0, 0), c("scarcity", 0, 6)) })}
      {item("Whether AI pays off", 1, 0, -70)}
      <InkPath d="M0,14 C180,2 400,22 620,8" w={620} h={22} stroke={10} progress={prog(f, c("not", 0, -2), c("scarcity", 0, 8), OUT)} style={{ left: 120, top: SLOT[1] + 22 }} />
      <Handwrite text="now" at={c("now", 0, -2)} dur={10} size={92} rot={-6} style={{ left: 1000, top: 8 }} />
    </div>
  );
};

// The rate path: a staircase climbing the page.
const STEPS = "M0,400 C40,401 80,399 120,400 C121,373 119,347 120,320 C176,321 233,319 290,320 C291,293 289,267 290,240 C346,241 403,239 460,240 C461,213 459,187 460,160 C516,161 573,159 630,160 C631,133 629,107 630,80 C686,81 743,79 800,80 C801,53 799,27 800,0";

const KEYS: CamKey[] = [
  { f: -12, x: 800, y: 500, s: 1.14 },
  { f: c("So"), x: 800, y: 500, s: 1.12 },
  { f: c("scarcity", 0, 0), x: 800, y: 510, s: 1.1 },
  { f: c("ten-year", 0, 4), x: 1190, y: 1500, s: 1.0 },
  { f: c("cycle", 0, 30), x: 1195, y: 1505, s: 1.02 },
];

export const S6Thesis: React.FC = () => {
  const f = useF();
  return (
    <AbsoluteFill style={{ background: DARK, overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <Img src={staticFile("common/paper.jpg")} style={{ position: "absolute", left: -300, top: -300, width: 2800, height: 2600, objectFit: "cover", filter: "invert(0.9) sepia(0.35) brightness(0.62) contrast(1.15)" }} />
        <Abs x={100} y={92} style={{ fontSize: 32, fontWeight: 600, letterSpacing: "0.18em", color: CREAM, opacity: 0.9, fontFamily: MONO }}>
          <TypeOn text="TRADE SETUP" at={c("So")} cps={30} />
        </Abs>
        <Abs x={96} y={136} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1, letterSpacing: "-0.035em", color: CREAM }}>
          <CueWords words={[["The", c("the")], ["thesis", c("thesis")], ["is", c("is")]]} />
        </Abs>
        <Handwrite text="UNCHANGED" at={c("unchanged", 0, -4)} dur={16} rot={-5} size={92} halo={null} underline style={{ left: 840, top: 132 }} />
        <Agenda />

        {/* ── the 10-year ── */}
        <Abs x={350} y={1236} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: CREAM, fontFamily: MONO, opacity: 0.9 }}>
          <TypeOn text="US 10-YEAR YIELD" at={c("ten-year", 0, -6)} cps={40} />
        </Abs>
        <Abs x={336} y={1280} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 250, lineHeight: 1, letterSpacing: "-0.05em", color: CREAM }}>
          <CountUp at={c("ten-year", 0, -2)} dur={c("near", 0, 8) - c("ten-year", 0, -2)} from={4.6} to={4.98} decimals={2} suffix="%" />
        </Abs>
        <Handwrite text="near 5%" at={c("five", 0, -4)} dur={14} size={104} halo={null} rot={-5} underline style={{ left: 380, top: 1560 }} />

        {/* ── the hiking cycle ── */}
        <Abs x={1250} y={1236} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: CREAM, fontFamily: MONO, opacity: 0.9 }}>
          <TypeOn text="MARKETS PRICE" at={c("markets", 0, -4)} cps={36} />
        </Abs>
        <InkPath d={STEPS} w={800} h={400} stroke={12} head progress={prog(f, c("new", 0, -4), c("cycle", 0, 12), OUT)} style={{ left: 1214, top: 1264 }} />
        <div style={{ position: "absolute", left: 1246, top: 1730, fontFamily: SERIF, fontWeight: 900, fontSize: 80, lineHeight: 1, letterSpacing: "-0.03em", color: CREAM, whiteSpace: "nowrap" }}>
          <CueWords words={[["a", c("a")], ["new", c("new")], ["hiking", c("hiking")], ["cycle", c("cycle")]]} wordStyle={(i) => (i >= 2 ? { color: SPOT } : undefined)} />
        </div>
      </Camera>
    </AbsoluteFill>
  );
};
