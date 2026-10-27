import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, Scrawl, Tape } from "../design/Hand";
import { EASE, OUT, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, Stamp, TypeOn } from "../design/Type";
import { Abs, GraphPaper } from "../design/ui";
import { CREAM, FRAKTUR, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 07 · Watch — the ten-year plotted on graph paper runs up to a high-jump bar set at 5.15% and hovers just
// under it; the week planner gets THU jobless claims and FRI PMI written in. Then a typed sheet: the
// question for chips, SUPPLY?, is painted out with correction fluid and RETURNS? typed over it — while a
// playbill goes up: on stage Wednesday, Tesla, Meta and Nvidia.
// "Watch the ten-year around five point one five, with jobless claims and Friday's PMI ahead. In chips, the
//  question shifts from supply to returns, as Tesla, Meta and Nvidia take the stage Wednesday."
const c = (w: string, nth = 0, off = 0) => cue(6, w, nth, off);

// graph: 5.15% at y 500, 1600px per percentage point
const G = { x: 100, y: 420, w: 1060, h: 520 };
const yOf = (v: number) => 500 - (v - 5.15) * 1600;
const PTS: [number, number][] = [[150, 4.96], [250, 4.99], [350, 4.98], [450, 5.04], [550, 5.03], [650, 5.09], [740, 5.08], [830, 5.13], [910, 5.12], [990, 5.14]];
const LINE = PTS.map(([x, v], i) => `${i ? "L" : "M"}${x},${yOf(v).toFixed(1)}`).join(" ");

const DayCard: React.FC<{ x: number; y: number; day: string; at: number; rot: number; children: React.ReactNode }> = ({ x, y, day, at, rot, children }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.2);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 570, height: 200, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 130, background: INK, color: CREAM, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TABLOID, fontSize: 56, letterSpacing: "0.06em" }}>{day}</div>
      {[...Array(3)].map((_, k) => (
        <div key={k} style={{ position: "absolute", left: 150, right: 20, top: 60 + k * 50, height: 2, background: "rgba(60,110,140,0.25)" }} />
      ))}
      {children}
    </div>
  );
};

const Billing: React.FC<{ name: string; sub: string; at: number; size?: number }> = ({ name, sub, at, size = 116 }) => (
  <div style={{ textAlign: "center", marginTop: 10 }}>
    <div style={{ fontFamily: TABLOID, fontSize: size, lineHeight: 1, letterSpacing: "0.03em", color: INK }}>
      <Stamp at={at}>{name}</Stamp>
    </div>
    <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.2em", color: INK, opacity: 0.75, marginTop: 4 }}>
      <TypeOn text={sub} at={at + 4} cps={50} caret={false} />
    </div>
  </div>
);

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 530, s: 1.06 },
  { f: c("ten-year", 0, 0), x: 760, y: 590, s: 1.06 },
  { f: c("five", 1, 6), x: 770, y: 595, s: 1.08 },
  { f: c("with", 0, 2), x: 990, y: 550, s: 1.0 },
  { f: c("In", 0, -14), x: 990, y: 550, s: 1.0 },
  { f: c("In", 0, 6), x: 2800, y: 550, s: 1.0 },
  { f: c("as", 0, -10), x: 2800, y: 550, s: 1.0 },
  { f: c("as", 0, 8), x: 3120, y: 545, s: 1.0 },
  { f: c("Wednesday", 0, 30), x: 3125, y: 548, s: 1.03 },
];

export const S7Watch: React.FC = () => {
  const f = useF();
  const line = prog(f, c("ten-year", 0, -2), c("five", 1, 6), (t) => t);
  const bar = prog(f, c("around", 0, -4), c("five", 0, 0), OUT);
  const fluid = prog(f, c("supply", 0, 6), c("to", 0, 4), EASE);
  const poster = slap(f, c("as", 0, -6), 1.2, 1.15);
  const band = slap(f, c("Wednesday", 0, -2), -3, 1.4);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -300, top: -300, width: 4700, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the ten-year at the bar ── */}
        <Abs x={100} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="WATCH LIST · THIS WEEK" at={c("Watch")} cps={40} />
        </Abs>
        <Abs x={92} y={160} w={1100} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 116, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["Watch", c("Watch")], ["the", c("the")], ["10-year.", c("ten-year")]]} gap="0.22em" wordStyle={(i) => (i === 2 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>
        <GraphPaper w={G.w} h={G.h} style={{ left: G.x, top: G.y, transform: "rotate(-0.6deg)" }} />
        <Abs x={G.x + 24} y={G.y + 20} style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: INK }}>
          US 10-YEAR YIELD
        </Abs>
        {/* the high-jump bar at 5.15% */}
        <div style={{ position: "absolute", left: 760, top: yOf(5.15) - 70, width: 18, height: G.y + G.h - yOf(5.15) + 50, background: INK, opacity: bar }} />
        <div style={{ position: "absolute", left: 1100, top: yOf(5.15) - 70, width: 18, height: G.y + G.h - yOf(5.15) + 50, background: INK, opacity: bar }} />
        <div style={{ position: "absolute", left: 740, top: yOf(5.15) - 9, width: 400 * bar, height: 18, background: `repeating-linear-gradient(90deg, ${SPOT} 0 40px, ${CREAM} 40px 80px)`, boxShadow: "0 6px 8px rgba(40,24,8,0.3)" }} />
        <InkPath d={LINE} w={1100} h={900} stroke={9} color={INK} progress={line} style={{ left: 0, top: 0 }} />
        {line > 0.99 ? <div style={{ position: "absolute", left: 990 - 13, top: yOf(5.14) - 13, width: 26, height: 26, borderRadius: 13, background: SPOT, border: `4px solid ${CREAM}` }} /> : null}
        <Abs x={780} y={yOf(5.15) - 160} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-0.04em", color: SPOT, filter: "url(#ink)" }}>
          <Stamp at={c("five", 0, -2)}>5.15%</Stamp>
        </Abs>
        <Scrawl text="around" at={c("around", 0, -2)} dur={12} size={56} rot={-6} color={INK} style={{ left: 560, top: yOf(5.15) - 48 }} />

        {/* the week planner */}
        <DayCard x={1240} y={410} day="THU" at={c("jobless", 0, -4)} rot={-2}>
          <Scrawl text="jobless claims" at={c("jobless", 0, 0)} dur={14} size={46} color={INK} rot={-3} style={{ left: 160, top: 64 }} />
        </DayCard>
        <DayCard x={1250} y={660} day="FRI" at={c("Friday's", 0, -4)} rot={1.5}>
          <Scrawl text="PMI flash" at={c("PMI", 0, -2)} dur={12} size={58} color={INK} rot={-3} style={{ left: 160, top: 64 }} />
        </DayCard>
        <Tape x={1450} y={392} rot={-5} w={140} h={42} opacity={prog(f, c("jobless", 0, 2), c("jobless", 0, 4))} />
        <Scrawl text="ahead" at={c("ahead", 0, -2)} dur={10} size={60} rot={-6} style={{ left: 1560, top: 890 }} />

        {/* ── chips: the question changes ── */}
        <Abs x={2310} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="SEMICONDUCTORS" at={c("In", 0, -2)} cps={40} />
        </Abs>
        <div style={{ position: "absolute", left: 2300, top: 200, width: 840, height: 640, background: "#fbf8ef", transform: "rotate(-1.2deg)", boxShadow: "0 16px 24px rgba(40,24,8,0.24)" }}>
          <div style={{ position: "absolute", left: 60, top: 60 }}>
            <TypeOn text="THE QUESTION FOR CHIPS:" at={c("chips", 0, -2)} cps={44} style={{ fontWeight: 600, fontSize: 34, letterSpacing: "0.08em", color: INK }} />
          </div>
          <div style={{ position: "absolute", left: 56, top: 170 }}>
            <TypeOn text="SUPPLY?" at={c("question", 0, 2)} cps={22} style={{ fontWeight: 600, fontSize: 132, letterSpacing: "0.02em", color: INK }} />
          </div>
          {/* correction fluid, brushed over */}
          <div style={{ position: "absolute", left: 40, top: 168, width: 660 * fluid, height: 170, background: "#fffdf7", borderRadius: "30px 50px 40px 26px", boxShadow: "0 2px 3px rgba(40,24,8,0.15)", filter: "url(#marker-rough)" }} />
          <div style={{ position: "absolute", left: 56, top: 176 }}>
            <TypeOn text="RETURNS?" at={c("returns", 0, -4)} cps={24} style={{ fontWeight: 600, fontSize: 132, letterSpacing: "0.02em", color: SPOT }} />
          </div>
        </div>
        <Handwrite text="shifts" at={c("shifts", 0, -2)} dur={12} size={84} rot={-7} style={{ left: 2830, top: 120 }} />
        <InkPath d="M0,0 C30,40 50,90 40,150" w={60} h={150} stroke={7} head progress={prog(f, c("shifts", 0, 6), c("from", 0, 4), OUT)} style={{ left: 2880, top: 220 }} />

        {/* the playbill */}
        {poster.visible ? (
          <div style={{ position: "absolute", left: 3240, top: 110, width: 720, height: 820, background: "#f6eedb", transform: poster.transform, opacity: poster.opacity, filter: poster.filter }}>
            <div style={{ position: "absolute", left: 18, top: 18, right: 18, bottom: 18, border: `4px solid ${INK}` }} />
            <div style={{ position: "absolute", left: 30, top: 30, right: 30, bottom: 30, border: `1.5px solid ${INK}` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 56, textAlign: "center", fontFamily: FRAKTUR, fontSize: 76, color: INK, lineHeight: 1 }}>On Stage</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 146, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.3em", color: INK }}>AI EARNINGS WEEK</div>
            <div style={{ position: "absolute", left: 60, right: 60, top: 184, height: 3, background: INK }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 200 }}>
              <Billing name="TESLA" sub="EARNINGS · AFTER THE BELL" at={c("Tesla", 0, -2)} />
              <Billing name="META" sub="EARNINGS · AFTER THE BELL" at={c("Meta", 0, -2)} />
              <Billing name="NVIDIA" sub="GTC BERLIN · KEYNOTE" at={c("Nvidia", 0, -2)} />
            </div>
          </div>
        ) : null}
        {band.visible ? (
          <div style={{ position: "absolute", left: 3200, top: 862, width: 800, padding: "14px 0 10px", background: SPOT, textAlign: "center", fontFamily: TABLOID, fontSize: 84, lineHeight: 1, letterSpacing: "0.1em", color: CREAM, transform: band.transform, opacity: band.opacity, filter: band.filter }}>
            WEDNESDAY
          </div>
        ) : null}
        <Tape x={3530} y={90} rot={3} w={150} h={44} opacity={prog(f, c("as", 0, 0), c("as", 0, 2))} />
      </Camera>
    </AbsoluteFill>
  );
};
