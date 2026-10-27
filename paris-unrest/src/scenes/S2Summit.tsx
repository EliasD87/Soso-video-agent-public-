import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, Scrawl, Tape } from "../design/Hand";
import { clamp, EASE, OUT, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CountUp, CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { BODY, CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 02 · Stalemate — two tear-off day sheets, and a marker tallies the clashes across them: six strokes in
// two days. A tape measure stands on the desk: on "climbed" its blade runs up from $106 to the 110 mark.
// The camera moves to the summit table: Putin's proposal sets out three place cards (U.S., CHINA, RUSSIA),
// and beside it the US sanctions sheet is written PAUSED.
// "Houthi and Saudi forces clashed six times in two days. Brent climbed to near a hundred and ten. Putin
//  proposed a Ukraine summit, and the US paused Russia sanctions."
const c = (w: string, nth = 0, off = 0) => cue(1, w, nth, off);

// the tape measure: blade value at the case mouth = 100, PX per dollar
const TAPE = { x: 1330, y: 780, w: 116 };
const PX = 52;
const yOf = (v: number) => TAPE.y - (v - 100) * PX;

const DaySheet: React.FC<{ x: number; y: number; label: string; rot: number; at: number }> = ({ x, y, label, rot, at }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.2);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 420, height: 460, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ height: 22, background: "repeating-linear-gradient(90deg, #d8cfba 0 14px, transparent 14px 24px)" }} />
      <div style={{ height: 86, background: SPOT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TABLOID, fontSize: 60, color: CREAM, letterSpacing: "0.08em" }}>{label}</div>
      {[...Array(6)].map((_, k) => (
        <div key={k} style={{ position: "absolute", left: 28, right: 28, top: 150 + k * 52, height: 2, background: "rgba(60,110,140,0.25)" }} />
      ))}
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 760, y: 560, s: 1.1 },
  { f: c("six", 0, -6), x: 740, y: 570, s: 1.06 },
  { f: c("Brent", 0, -12), x: 740, y: 570, s: 1.06 },
  { f: c("Brent", 0, 6), x: 990, y: 540, s: 1.0 },
  { f: c("Putin", 0, -14), x: 990, y: 540, s: 1.0 },
  { f: c("Putin", 0, 6), x: 2950, y: 545, s: 1.0 },
  { f: c("sanctions", 0, 30), x: 2955, y: 548, s: 1.03 },
];

export const S2Summit: React.FC = () => {
  const f = useF();
  // six tally strokes across the two days
  const strokes = [c("clashed", 0, 2), c("six", 0, 0), c("times", 0, -2), c("times", 0, 6), c("in", 0, 2), c("days", 0, -2)];
  // the blade: ~$106 before, $109.95 after "climbed"
  const v = interpolate(f, [c("climbed", 0, -2), c("ten", 0, 6)], [105.9, 109.95], { ...clamp, easing: EASE });
  const caseIn = prog(f, c("Brent", 0, -10), c("Brent", 0, 4), OUT);
  const tip = yOf(v);
  const cards: [string, number, number, number][] = [
    ["U.S.", c("proposed", 0, 4), 2300, 600],
    ["CHINA", c("Ukraine", 0, -2), 2420, 515],
    ["RUSSIA", c("summit", 0, -2), 2520, 612],
  ];
  const doc = slap(f, c("and", 2, -6), 2, 1.2);
  const pause = prog(f, c("paused", 0, -2), c("paused", 0, 10), OUT);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -300, top: -300, width: 4600, height: 1700 }}>
          <Paper />
        </div>

        {/* ── six clashes, two days ── */}
        <Abs x={100} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="HOUTHI ⇄ SAUDI · 48 HOURS" at={c("Houthi")} cps={40} />
        </Abs>
        <Abs x={92} y={160} w={1120} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords
            words={[["Clashed", c("clashed")], ["six", c("six")], ["times", c("times")], ["in", c("in")], ["two", c("two")], ["days.", c("days")]]}
            gap="0.22em"
            wordStyle={(i) => (i === 1 ? { color: SPOT, fontStyle: "italic" } : undefined)}
          />
        </Abs>
        <DaySheet x={110} y={410} label="DAY 1" rot={-3} at={c("Houthi", 0, 2)} />
        <DaySheet x={570} y={420} label="DAY 2" rot={2.5} at={c("Saudi", 0, 0)} />
        {strokes.map((at, k) => {
          const day = k < 3 ? 0 : 1;
          const i = k % 3;
          const x = (day ? 650 : 190) + i * 82;
          const y = day ? 560 : 548;
          return <InkPath key={k} d={`M${6 + (i % 2) * 4},0 C${2 + i},90 ${10 - i},170 ${4 + i * 2},250`} w={20} h={250} stroke={16} progress={prog(f, at, at + 5, OUT)} style={{ left: x, top: y }} />;
        })}
        <Abs x={120} y={898} style={{ fontFamily: MONO, fontWeight: 600, fontSize: 28, letterSpacing: "0.14em", color: INK, opacity: prog(f, c("clashed", 0, 0), c("clashed", 0, 4)) }}>
          MILITARY OPERATIONS:{" "}
          <span style={{ color: SPOT }}>
            {strokes.filter((at) => f >= at + 2).length}
          </span>
        </Abs>

        {/* ── Brent: the tape measure ── */}
        <div style={{ opacity: caseIn, transform: `translateY(${(1 - caseIn) * 80}px)` }}>
          <Abs x={1520} y={180} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
            <TypeOn text="BRENT · $/BBL" at={c("Brent", 0, -4)} cps={36} />
          </Abs>
          {/* the blade */}
          <div style={{ position: "absolute", left: TAPE.x, top: tip, width: TAPE.w, height: TAPE.y - tip + 10, background: "linear-gradient(90deg, #e9c63a, #f6dc5c 40%, #e2bc2c)", boxShadow: "4px 0 10px rgba(40,24,8,0.25)", overflow: "hidden" }}>
            {[...Array(Math.ceil((v - 100) * 4) + 1)].map((_, k) => {
              const val = 100 + k * 0.25;
              const y = (v - val) * PX;
              const major = k % 4 === 0;
              return (
                <React.Fragment key={k}>
                  <div style={{ position: "absolute", left: 0, top: y, width: major ? 46 : k % 2 ? 16 : 28, height: major ? 4 : 2.5, background: INK }} />
                  {major ? (
                    <div style={{ position: "absolute", left: 52, top: y - 20, fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: val >= 110 ? SPOT : INK, letterSpacing: "-0.02em" }}>{val}</div>
                  ) : null}
                </React.Fragment>
              );
            })}
          </div>
          {/* the hook at the tip */}
          <div style={{ position: "absolute", left: TAPE.x - 10, top: tip - 14, width: TAPE.w + 20, height: 16, background: "#9a9a96", borderRadius: 3, boxShadow: "0 3px 5px rgba(0,0,0,0.3)" }} />
          {/* the case */}
          <div style={{ position: "absolute", left: TAPE.x - 70, top: TAPE.y - 4, width: 300, height: 190, borderRadius: 40, background: `linear-gradient(160deg, ${SPOT}, #c92a10)`, boxShadow: "0 18px 24px rgba(40,24,8,0.35), inset 0 -10px 18px rgba(0,0,0,0.18)" }}>
            <div style={{ position: "absolute", left: 92, top: 36, width: 118, height: 118, borderRadius: 59, background: INK, border: "8px solid #d8d2c4" }} />
          </div>
          {/* the 110 line */}
          <div style={{ position: "absolute", left: TAPE.x - 120, top: yOf(110), width: 300 * prog(f, c("hundred", 0, -2), c("ten", 0, 4), OUT), borderTop: `5px dashed ${SPOT}` }} />
          <Abs x={1520} y={yOf(v) - 30} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 96, lineHeight: 1, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", opacity: f >= c("climbed", 0, -2) ? 1 : 0 }}>
            <CountUp at={c("climbed", 0, -2)} dur={c("ten", 0, 6) - c("climbed", 0, -2)} from={105.9} to={109.95} decimals={2} prefix="$" />
          </Abs>
          <Scrawl text="+3.8%" at={c("ten", 0, 2)} dur={10} size={64} rot={-5} style={{ left: 1560, top: yOf(110) + 100 }} />
        </div>

        {/* ── the summit table ── */}
        <Abs x={2080} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="UKRAINE TALKS · APEC · NOVEMBER" at={c("Putin", 0, -2)} cps={44} />
        </Abs>
        <Abs x={2072} y={160} w={1100} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["Putin", c("Putin")], ["proposed", c("proposed")], ["a", c("a", 1)], ["Ukraine", c("Ukraine")], ["summit.", c("summit")]]} gap="0.22em" wordStyle={(i) => (i === 4 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>
        <Img src={staticFile("scenes/table.png")} style={{ position: "absolute", left: 2120, top: 380, width: 780, filter: "drop-shadow(0 18px 18px rgba(40,24,8,0.25))", opacity: prog(f, c("Putin", 0, -10), c("Putin", 0, 0)) }} />
        {cards.map(([t, at, x, y], k) => {
          const s = slap(f, at, [-6, 3, -2][k], 1.4);
          return s.visible ? (
            <div key={t} style={{ position: "absolute", left: x, top: y, padding: "10px 18px 8px", background: CREAM, borderBottom: `6px solid ${INK}`, transform: s.transform, opacity: s.opacity, filter: s.filter }}>
              <div style={{ fontFamily: TABLOID, fontSize: 46, lineHeight: 1, letterSpacing: "0.06em", color: INK }}>{t}</div>
            </div>
          ) : null;
        })}

        {/* the sanctions sheet, written PAUSED */}
        {doc.visible ? (
          <div style={{ position: "absolute", left: 3080, top: 380, width: 600, height: 560, background: "#fbf8ef", transform: doc.transform, opacity: doc.opacity, filter: doc.filter }}>
            <div style={{ position: "absolute", left: 40, top: 36, fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: INK }}>US SANCTIONS · RUSSIA</div>
            <div style={{ position: "absolute", left: 40, top: 78, width: 520, height: 3, background: INK }} />
            {[...Array(7)].map((_, k) => (
              <div key={k} style={{ position: "absolute", left: 40, top: 112 + k * 56, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, color: INK, opacity: 0.6 }}>{`§${k + 1}`}</div>
                <div style={{ width: 120 + ((k * 137) % 300), height: 18, background: INK, opacity: 0.82 }} />
              </div>
            ))}
            <div style={{ position: "absolute", left: 40, bottom: 34, fontFamily: BODY, fontStyle: "italic", fontSize: 30, color: INK, opacity: 0.8 }}>pending talks</div>
          </div>
        ) : null}
        <Tape x={3300} y={356} rot={-4} w={160} h={44} opacity={prog(f, c("and", 2, 0), c("and", 2, 2))} />
        <div style={{ position: "absolute", left: 3150, top: 520, display: "flex", gap: 36, opacity: pause > 0 ? 1 : 0 }}>
          <InkPath d="M0,0 L2,190" w={4} h={190} stroke={40} progress={prog(f, c("paused", 0, -4), c("paused", 0, 2), OUT)} style={{ left: 0, top: 0 }} />
          <InkPath d="M0,0 L-2,190" w={4} h={190} stroke={40} progress={prog(f, c("paused", 0, 0), c("paused", 0, 6), OUT)} style={{ left: 90, top: 0 }} />
        </div>
        <Handwrite text="PAUSED" at={c("paused", 0, 2)} dur={14} rot={-6} size={112} underline style={{ left: 3300, top: 560 }} />
      </Camera>
    </AbsoluteFill>
  );
};
