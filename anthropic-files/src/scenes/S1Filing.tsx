import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, Highlight, InkPath, MarkerLoop, Tape } from "../design/Hand";
import { OUT, prog, slap, useF } from "../design/motion";
import { CountUp, CueWords, Stamp, TypeOn } from "../design/Type";
import { Abs, Rule } from "../design/ui";
import { BODY, CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 01 · Anthropic files — the magazine shot: the registration statement itself, tilted, read in shallow
// focus. The headline prints word by word; "Nasdaq" is highlighted and the symbol ANT stamps under it. A
// November desk calendar is clipped to the page and the week of the 16th ringed, "likely" written beside
// it. The camera crosses to the financial data: adjusted operating profit counts up to $2.24B and is
// ringed; lower down "may dip" is written with an arrow down, next to the data-hall photo as compute ramps.
// "Anthropic has filed to go public on Nasdaq, likely the week of November sixteenth. Its second-quarter
//  operating profit topped two billion dollars, but may dip as compute ramps."
const c = (w: string, nth = 0, off = 0) => cue(0, w, nth, off);

const mono: React.CSSProperties = { fontFamily: MONO, fontSize: 28, fontWeight: 600, letterSpacing: "0.14em", color: INK };

const COPY =
  "The registration statement sets out the business, its risks and the intended use of proceeds. Shares are expected to trade under the symbol shown once the review is complete, subject to market conditions. ";

// November 2026 begins on a Sunday.
const CAL = { x: 760, y: 660, w: 532, h: 470 };
const CW = CAL.w / 7;
const CH = 62;

const Calendar: React.FC = () => {
  const f = useF();
  const s = slap(f, c("likely", 0, -8), 2, 1.15);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: CAL.x, top: CAL.y, width: CAL.w, height: CAL.h, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ height: 64, background: INK, color: CREAM, fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", lineHeight: "66px", paddingLeft: 24 }}>NOVEMBER 2026</div>
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <div key={i} style={{ position: "absolute", left: i * CW, top: 80, width: CW, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 20, color: INK, opacity: 0.6 }}>
          {d}
        </div>
      ))}
      {[...Array(30)].map((_, i) => {
        const d = i + 1;
        const hot = d >= 16 && d <= 20;
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: (i % 7) * CW,
              top: 118 + Math.floor(i / 7) * CH,
              width: CW,
              textAlign: "center",
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 38,
              lineHeight: `${CH}px`,
              color: hot ? SPOT : INK,
              opacity: hot ? 1 : 0.78,
            }}
          >
            {d}
          </div>
        );
      })}
      <MarkerLoop w={CW * 5 + 24} h={74} seed="week16" progress={prog(f, c("week", 0, -2), c("sixteenth", 0, 8))} style={{ left: CW - 40, top: 118 + 2 * CH - 26 }} />
      <Tape x={200} y={-22} rot={-2} w={140} h={40} />
    </div>
  );
};

const Page: React.FC = () => {
  const f = useF();
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 2800, height: 1800 }}>
      <Img src={staticFile("common/paper.jpg")} style={{ position: "absolute", left: -700, top: -400, width: 4200, height: 2700, objectFit: "cover", filter: "sepia(0.18) saturate(1.2) brightness(1.06)" }} />
      <Rule x={100} y={150} w={2600} t={5} />
      <Rule x={100} y={162} w={2600} t={1.5} />
      <Abs x={110} y={186} style={{ ...mono, fontSize: 30, letterSpacing: "0.16em" }}>
        <TypeOn text="FORM S-1 · REGISTRATION STATEMENT" at={c("Anthropic", 0, -8)} cps={56} />
      </Abs>
      <div style={{ position: "absolute", left: 96, top: 250, fontFamily: SERIF, fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
        <CueWords words={[["Anthropic", c("Anthropic")], ["has", c("has")], ["filed", c("filed")]]} />
        <div>
          <CueWords words={[["to", c("to")], ["go", c("go")], ["public.", c("public")]]} wordStyle={(i) => (i === 2 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1940, top: 262, width: 720, height: 300, columnCount: 2, columnGap: 32, fontFamily: BODY, fontSize: 24, lineHeight: 1.42, textAlign: "justify", color: INK, opacity: 0.8, overflow: "hidden" }}>
        {COPY.repeat(3)}
      </div>
      <Rule x={100} y={600} w={2600} t={2} color="rgba(25,23,20,0.4)" />
      <div style={{ position: "absolute", left: 1348, top: 640, width: 3, height: 1060, background: "rgba(25,23,20,0.3)" }} />

      {/* ── the listing ── */}
      <Abs x={114} y={650} style={{ ...mono, opacity: prog(f, c("on", 0, -4), c("on", 0, 2)) }}>
        PROPOSED EXCHANGE
      </Abs>
      <Highlight w={540} h={92} progress={prog(f, c("Nasdaq", 0, -2), c("Nasdaq", 0, 10), OUT)} style={{ left: 96, top: 722 }} />
      <Abs x={104} y={694} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, lineHeight: 1, letterSpacing: "-0.035em", color: INK }}>
        <CueWords words={[["Nasdaq", c("Nasdaq")]]} />
      </Abs>
      <Abs x={114} y={884} style={{ ...mono, opacity: prog(f, c("Nasdaq", 0, 8), c("Nasdaq", 0, 14)) }}>
        SYMBOL
      </Abs>
      <Abs x={104} y={920} style={{ fontFamily: TABLOID, fontSize: 230, lineHeight: 1, letterSpacing: "0.04em", color: SPOT }}>
        <Stamp at={c("Nasdaq", 0, 12)}>ANT</Stamp>
      </Abs>
      <Calendar />
      <Handwrite text="likely" at={c("likely", 0, -2)} dur={12} size={84} rot={-5} style={{ left: 830, top: 1150 }} />
      <div style={{ position: "absolute", left: 110, top: 1300, width: 1180, height: 380, columnCount: 3, columnGap: 32, fontFamily: BODY, fontSize: 24, lineHeight: 1.42, textAlign: "justify", color: INK, opacity: 0.8, overflow: "hidden" }}>
        {COPY.repeat(5)}
      </div>

      {/* ── the financial data ── */}
      <Abs x={1410} y={650} style={mono}>
        <TypeOn text="SELECTED FINANCIAL DATA · Q2 2026" at={c("Its", 0, -8)} cps={60} />
      </Abs>
      <Rule x={1400} y={700} w={1250} t={2} progress={prog(f, c("Its", 0, -8), c("Its", 0, 6))} />
      <Abs x={1410} y={728} style={{ ...mono, opacity: prog(f, c("second-quarter", 0, -2), c("second-quarter", 0, 6)) }}>
        ADJ. OPERATING PROFIT
      </Abs>
      <Abs x={1394} y={772} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 290, lineHeight: 1, letterSpacing: "-0.05em", color: INK, opacity: prog(f, c("operating", 0, -2), c("operating", 0, 4)) }}>
        <CountUp at={c("operating", 0, 0)} dur={c("dollars", 0, 8) - c("operating", 0, 0)} from={0} to={2.24} decimals={2} prefix="$" suffix="B" />
      </Abs>
      <MarkerLoop w={1060} h={320} seed="profit" progress={prog(f, c("dollars", 0, 2), c("dollars", 0, 16))} style={{ left: 1340, top: 750 }} />
      <Abs x={1410} y={1100} style={{ ...mono, opacity: 0.75 * prog(f, c("dollars", 0, 10), c("dollars", 0, 16)) }}>
        MARGIN · 19%
      </Abs>

      {/* ── may dip as compute ramps ── */}
      <Handwrite text="may dip" at={c("may", 0, -4)} dur={14} size={112} rot={-4} underline style={{ left: 1430, top: 1196 }} />
      <InkPath d="M0,0 C12,50 -6,100 6,150" w={12} h={150} stroke={10} head progress={prog(f, c("dip", 0, -2), c("dip", 0, 10), OUT)} style={{ left: 1900, top: 1196 }} />
      <div style={{ position: "absolute", left: 2080, top: 1170, width: 620, transform: "rotate(1.5deg)", boxShadow: "0 10px 18px rgba(40,24,8,0.22)" }}>
        <Img src={staticFile("scenes/datacenter.png")} style={{ width: 620, display: "block" }} />
      </div>
      <Tape x={2310} y={1150} rot={-4} w={140} h={40} />
      <Abs x={2090} y={1650} style={{ ...mono, fontSize: 24 }}>
        COMPUTE
      </Abs>
      <InkPath d="M6,300 C-6,200 10,100 0,0" w={12} h={300} stroke={10} color={SPOT} head progress={prog(f, c("compute", 0, -2), c("ramps", 0, 10), OUT)} style={{ left: 2700, top: 1220 }} />
      <Handwrite text="as compute ramps" at={c("compute", 0, -6)} dur={16} size={62} color={INK} rot={-4} style={{ left: 1440, top: 1450 }} />
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 1000, y: 430, s: 1.1 },
  { f: c("Anthropic"), x: 1000, y: 440, s: 1.08 },
  { f: c("public", 0, -2), x: 990, y: 460, s: 1.06 },
  { f: c("Nasdaq", 0, 6), x: 820, y: 820, s: 1.0 },
  { f: c("sixteenth", 0, 4), x: 840, y: 830, s: 1.0 },
  { f: c("Its", 0, 4), x: 1980, y: 820, s: 1.0 },
  { f: c("dollars", 0, 8), x: 1990, y: 830, s: 1.0 },
  { f: c("may", 0, 4), x: 2060, y: 1200, s: 0.98 },
  { f: c("ramps", 0, 40), x: 2070, y: 1210, s: 0.97 },
];

export const S1Filing: React.FC = () => (
  <AbsoluteFill style={{ background: "#2a2019", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, perspective: 1700, perspectiveOrigin: "50% 22%" }}>
      <div style={{ position: "absolute", left: -320, top: -300, width: 2560, height: 1700, transform: "rotateX(16deg) rotateZ(-2deg)", transformOrigin: "50% 60%" }}>
        <Camera keys={KEYS} vw={2560} vh={1700}>
          <div style={{ position: "absolute", left: -1200, top: -1000, width: 5200, height: 3800, background: "radial-gradient(ellipse at 50% 40%, #3a2c22, #1e1712 70%)" }} />
          <Page />
          <Tape x={2420} y={130} rot={32} w={120} h={40} />
        </Camera>
      </div>
    </div>
    {/* shallow depth of field */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 340, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, backdropFilter: "blur(4px)", WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 100%)", maskImage: "linear-gradient(0deg, #000 0%, transparent 100%)" }} />
  </AbsoluteFill>
);
