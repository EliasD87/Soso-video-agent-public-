import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, Scrawl } from "../design/Hand";
import { IN, OUT, prog, slap, useF } from "../design/motion";
import { TypeOn, CueWords } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, DARK, HILITE, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 06 · Trade setup — the black ink page. The thesis is written UNCHANGED. Yields are a marker line inside a
// sealed glass jar: it climbs, hits the lid and flattens under it — high, but contained. Beside it, a box of
// matches labelled TECH EARNINGS: the match is struck along the box and flares on "catalyst".
// "The thesis is unchanged. Yields are high but contained, and tech earnings are the catalyst."
const c = (w: string, nth = 0, off = 0) => cue(5, w, nth, off);

const JAR = { x: 220, y: 360, w: 430 };
const JH = Math.round((JAR.w * 1200) / 900);
// the yield line inside the jar (box-relative), ending flat under the lid
const LINE = "M10,300 L52,236 L84,258 L124,166 L156,196 L190,92 L214,30 L238,24 L258,32 L280,22";

const Flame: React.FC<{ x: number; y: number; at: number }> = ({ x, y, at }) => {
  const f = useF();
  if (f < at) return null;
  const g = prog(f, at, at + 8, OUT);
  const fl = 1 + Math.sin(f * 1.7) * 0.06 + Math.sin(f * 0.9) * 0.05;
  const sway = Math.sin(f * 0.6) * 4;
  const sparks = prog(f, at, at + 10, OUT);
  return (
    <div style={{ position: "absolute", left: x - 70, top: y - 200, width: 140, height: 220, transformOrigin: "50% 100%", transform: `scale(${g * fl}, ${g * (2 - fl)}) rotate(${sway}deg)` }}>
      <svg width={140} height={220} viewBox="0 0 140 220" style={{ overflow: "visible" }}>
        <path d="M70,4 C96,60 132,96 128,150 C124,196 98,216 70,216 C42,216 14,196 12,150 C8,100 50,72 70,4 Z" fill={SPOT} />
        <path d="M70,70 C86,104 104,128 100,160 C96,190 84,202 70,202 C56,202 42,190 40,160 C38,130 58,112 70,70 Z" fill={HILITE} />
        {sparks < 1
          ? [...Array(8)].map((_, k) => {
              const a = Math.PI * (1.05 + (k / 7) * 0.9);
              return <line key={k} x1={70 + Math.cos(a) * (60 + sparks * 30)} y1={180 + Math.sin(a) * (60 + sparks * 30)} x2={70 + Math.cos(a) * (80 + sparks * 70)} y2={180 + Math.sin(a) * (80 + sparks * 70)} stroke={HILITE} strokeWidth={6} strokeLinecap="round" opacity={1 - sparks} />;
            })
          : null}
      </svg>
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 500, s: 1.06 },
  { f: c("unchanged", 0, 10), x: 960, y: 520, s: 1.0 },
  { f: c("Yields", 0, 4), x: 760, y: 600, s: 1.08 },
  { f: c("and", 0, -6), x: 760, y: 600, s: 1.08 },
  { f: c("tech", 0, 8), x: 1180, y: 600, s: 1.06 },
  { f: c("catalyst", 0, 34), x: 1000, y: 560, s: 1.0 },
];

export const S6Thesis: React.FC = () => {
  const f = useF();
  const line = prog(f, c("Yields", 0, -4), c("contained", 0, 6), (t) => t);
  const hitLid = c("contained", 0, 2);
  const jiggle = f >= hitLid ? Math.sin((f - hitLid) * 1.6) * 2.2 * Math.exp(-(f - hitLid) / 8) : 0;
  const box = slap(f, c("and", 0, -2), -2, 1.2);
  // the match: scraped along the strip, then lifted, alight
  const s0 = c("are", 1, -4);
  const scrape = prog(f, s0, c("catalyst", 0, -2), IN);
  const lift = prog(f, c("catalyst", 0, -2), c("catalyst", 0, 10), OUT);
  const hx = interpolate(scrape, [0, 1], [1810, 1390]) - lift * 20;
  const hy = 692 - lift * 140;
  const rot = -lift * 22;
  const matchIn = prog(f, c("tech", 0, -4), c("tech", 0, 6), OUT);
  return (
    <AbsoluteFill style={{ background: DARK, overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <Img src={staticFile("common/paper.jpg")} style={{ position: "absolute", left: -300, top: -300, width: 2600, height: 1800, objectFit: "cover", filter: "invert(0.9) sepia(0.35) brightness(0.62) contrast(1.15)" }} />
        <Abs x={100} y={92} style={{ fontSize: 32, fontWeight: 600, letterSpacing: "0.18em", color: CREAM, opacity: 0.9 }}>
          <TypeOn text="TRADE SETUP" at={c("The")} cps={30} />
        </Abs>
        <Abs x={96} y={132} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1, letterSpacing: "-0.035em", color: CREAM }}>
          <CueWords words={[["The", c("The")], ["thesis", c("thesis")], ["is", c("is")]]} />
        </Abs>
        <Handwrite text="UNCHANGED" at={c("unchanged", 0, -4)} dur={16} rot={-5} size={92} halo={null} underline style={{ left: 840, top: 128 }} />

        {/* yields, sealed in a jar */}
        <div style={{ position: "absolute", left: JAR.x, top: JAR.y, width: JAR.w, height: JH, transformOrigin: "50% 100%", transform: `rotate(${jiggle}deg)` }}>
          <Img src={staticFile("scenes/jar.png")} style={{ position: "absolute", left: 0, top: 0, width: JAR.w }} />
          <InkPath d={LINE} w={290} h={310} stroke={11} progress={line} style={{ left: 66, top: 100 }} />
          <div style={{ position: "absolute", left: 92, top: 438, width: 246, padding: "12px 0 10px", background: CREAM, textAlign: "center", boxShadow: "0 4px 8px rgba(0,0,0,0.35)", transform: "rotate(-2deg)" }}>
            <div style={{ fontFamily: TABLOID, fontSize: 48, lineHeight: 1, letterSpacing: "0.04em", color: INK }}>US 10Y</div>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, letterSpacing: "0.2em", color: INK, marginTop: 4 }}>YIELDS</div>
          </div>
        </div>
        <Abs x={700} y={330} style={{ fontSize: 26, fontWeight: 600, letterSpacing: "0.18em", color: CREAM, opacity: prog(f, c("Yields", 0, -4), c("Yields", 0, 2)) * 0.9 }}>
          YIELDS ARE
        </Abs>
        <Scrawl text="high" at={c("high", 0, -2)} dur={10} size={84} color={SPOT} rot={-6} style={{ left: 700, top: 370 }} />
        <InkPath d="M120,10 C80,0 40,10 0,40" w={120} h={40} stroke={7} head color={SPOT} progress={prog(f, c("high", 0, 4), c("but", 0, 4), OUT)} style={{ left: 560, top: 420 }} />
        <Handwrite text="but contained" at={c("contained", 0, -2)} dur={14} size={70} rot={-5} halo={null} color={CREAM} underline style={{ left: 700, top: 500 }} />

        {/* the catalyst: a box of matches */}
        {box.visible ? (
          <div style={{ position: "absolute", left: 1290, top: 700, width: 620, height: 200, transform: box.transform, opacity: box.opacity, filter: box.filter }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 620, height: 30, background: "repeating-linear-gradient(90deg, #4b3020 0 4px, #6a4630 4px 7px)", borderRadius: "4px 4px 0 0" }} />
            <div style={{ position: "absolute", left: 0, top: 30, width: 620, height: 170, background: CREAM, borderRadius: "0 0 4px 4px", boxShadow: "0 18px 24px rgba(0,0,0,0.5)" }}>
              <div style={{ position: "absolute", left: 22, top: 18, right: 22, bottom: 18, border: `4px solid ${SPOT}` }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", fontFamily: TABLOID, fontSize: 70, lineHeight: 1, letterSpacing: "0.04em", color: INK }}>
                <TypeOn text="TECH EARNINGS" at={c("tech", 0, -2)} cps={34} caret={false} style={{ fontFamily: TABLOID }} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 116, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 20, letterSpacing: "0.22em", color: INK, opacity: 0.7 }}>STRIKE ON BOX</div>
            </div>
          </div>
        ) : null}
        {/* the match */}
        <div style={{ position: "absolute", left: hx, top: hy, width: 0, height: 0, transform: `rotate(${rot}deg)`, opacity: matchIn }}>
          <div style={{ position: "absolute", left: 10, top: -9, width: 470, height: 18, background: "linear-gradient(180deg, #ecd6a6, #cfb27a)", borderRadius: 3, boxShadow: "0 8px 10px rgba(0,0,0,0.45)" }} />
          <div style={{ position: "absolute", left: -24, top: -20, width: 56, height: 40, borderRadius: "50% 42% 42% 50%", background: SPOT, boxShadow: "inset -6px -6px 10px rgba(0,0,0,0.3)" }} />
          <Flame x={-4} y={4} at={c("catalyst", 0, -2)} />
        </div>
        <Handwrite text="the catalyst" at={c("catalyst", 0, 2)} dur={14} size={84} rot={-6} halo={null} color={SPOT} underline style={{ left: 1300, top: 590 }} />
      </Camera>
    </AbsoluteFill>
  );
};

