import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, MarkerLoop, Scrawl, Tape } from "../design/Hand";
import { EASE, OUT, prog, slap, useF } from "../design/motion";
import { CueWords, TypeOn } from "../design/Type";
import { Abs, Rule } from "../design/ui";
import { BODY, CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 04 · The listing — the magazine shot: the AI page, tilted, read in shallow focus. Anthropic's S-1 cover
// sheet is clipped to the first column; the second column lays out the calendar as three date tiles —
// file next week, roadshow, listing by mid-November — ringed in marker as they are named. On "OpenAI" the
// lens racks focus to the third column: a stopwatch starts running, racing for sovereign money before then.
// "Anthropic plans to file for its IPO next week, with a listing by mid-November. OpenAI is reportedly
//  racing to raise sovereign money before then."
const c = (w: string, nth = 0, off = 0) => cue(3, w, nth, off);

const COPY =
  "The AI developer is preparing to submit its registration statement to the Securities and Exchange Commission, with a roadshow for investors to follow and shares expected to begin trading by the middle of November. A rival lab is said to be moving quickly to secure fresh financing from sovereign funds before the offering. ";

const Copy: React.FC<{ x: number; y: number; w: number; h: number; reps?: number }> = ({ x, y, w, h, reps = 3 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, columnCount: 2, columnGap: 40, fontFamily: BODY, fontSize: 26, lineHeight: 1.42, textAlign: "justify", color: INK, opacity: 0.88, overflow: "hidden" }}>
    {COPY.repeat(reps)}
  </div>
);

// One calendar tile: a torn-off date with what happens on it.
const Tile: React.FC<{ x: number; y: number; month: string; day: string; what: string; at: number; rot: number; hot?: boolean }> = ({ x, y, month, day, what, at, rot, hot }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.3);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 250, height: 300, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter, textAlign: "center" }}>
      <div style={{ height: 70, background: hot ? SPOT : INK, color: CREAM, fontFamily: TABLOID, fontSize: 46, lineHeight: "72px", letterSpacing: "0.08em" }}>{month}</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: day.length > 3 ? 74 : 128, lineHeight: day.length > 3 ? "150px" : "150px", letterSpacing: "-0.04em", color: INK }}>{day}</div>
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.14em", color: INK }}>{what}</div>
    </div>
  );
};

const Stopwatch: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const f = useF();
  const go = c("racing", 0, -4);
  const ang = f < go ? 0 : (f - go) * 14;
  // the dial centre sits at ~ (0.5, 0.585) of the cut-out
  const cx = w * 0.5;
  const cy = w * 0.585;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: w }}>
      <Img src={staticFile("scenes/stopwatch.png")} style={{ position: "absolute", left: 0, top: 0, width: w, filter: "drop-shadow(0 16px 16px rgba(40,24,8,0.3))" }} />
      <div style={{ position: "absolute", left: cx - 5, top: cy - w * 0.28, width: 10, height: w * 0.32, background: SPOT, borderRadius: 5, transformOrigin: `5px ${w * 0.28}px`, transform: `rotate(${ang}deg)` }} />
      <div style={{ position: "absolute", left: cx - 13, top: cy - 13, width: 26, height: 26, borderRadius: 13, background: SPOT }} />
    </div>
  );
};

const Page: React.FC = () => {
  const f = useF();
  // rack focus: the IPO columns go soft as the OpenAI column comes sharp
  const rack = prog(f, c("OpenAI", 0, -6), c("OpenAI", 0, 10), EASE);
  const blurL = 7 * rack;
  const blurR = 7 * (1 - rack);
  const clip = slap(f, c("for", 0, -4), -3, 1.2);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 2800, height: 1800 }}>
      <Img src={staticFile("common/paper.jpg")} style={{ position: "absolute", width: 2800, height: 1800, objectFit: "cover", filter: "sepia(0.18) saturate(1.2) brightness(1.06)" }} />
      <Rule x={100} y={150} w={2600} t={5} />
      <Rule x={100} y={162} w={2600} t={1.5} />
      <Abs x={110} y={186} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.16em", color: INK }}>
        <TypeOn text="ARTIFICIAL INTELLIGENCE · IPO WATCH" at={c("Anthropic", 0, -2)} cps={44} />
      </Abs>
      <Abs x={96} y={250} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 140, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
        <CueWords words={[["Anthropic", c("Anthropic")], ["plans", c("plans")], ["to", c("to")], ["file.", c("file")]]} wordStyle={(i) => (i === 3 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
      </Abs>
      <Rule x={100} y={460} w={2600} t={2} />

      <div style={{ position: "absolute", left: 0, top: 0, width: 1910, height: 1800, filter: blurL > 0.3 ? `blur(${blurL}px)` : undefined }}>
        {/* col 1: the S-1 cover sheet, clipped on */}
        {clip.visible ? (
          <div style={{ position: "absolute", left: 120, top: 520, width: 760, height: 620, background: "#fbf8ef", transform: clip.transform, opacity: clip.opacity, filter: clip.filter }}>
            <div style={{ position: "absolute", left: 50, top: 46, fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.2em", color: INK, opacity: 0.75 }}>UNITED STATES · SEC</div>
            <div style={{ position: "absolute", left: 46, top: 86, fontFamily: SERIF, fontWeight: 900, fontSize: 150, lineHeight: 1, letterSpacing: "-0.04em", color: INK }}>FORM S-1</div>
            <div style={{ position: "absolute", left: 50, top: 252, fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: "0.14em", color: INK }}>REGISTRATION STATEMENT</div>
            <div style={{ position: "absolute", left: 50, top: 296, width: 660, height: 2, background: INK, opacity: 0.6 }} />
            <div style={{ position: "absolute", left: 50, top: 330, fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: "0.14em", color: INK, opacity: 0.7 }}>REGISTRANT</div>
            <div style={{ position: "absolute", left: 48, top: 362 }}>
              <TypeOn text="Anthropic" at={c("IPO", 0, -4)} cps={30} caret={false} style={{ fontFamily: BODY, fontWeight: 700, fontSize: 92, color: INK }} />
            </div>
            <div style={{ position: "absolute", left: 50, top: 500, fontFamily: MONO, fontWeight: 500, fontSize: 20, letterSpacing: "0.14em", color: INK, opacity: 0.7 }}>INITIAL PUBLIC OFFERING</div>
            <svg width={60} height={150} viewBox="0 0 60 150" style={{ position: "absolute", left: 600, top: -70 }}>
              <path d="M18,140 L18,30 A12,12 0 0 1 42,30 L42,120 A8,8 0 0 1 26,120 L26,44" fill="none" stroke="#6e6a62" strokeWidth={6} strokeLinecap="round" />
            </svg>
          </div>
        ) : null}
        <Copy x={110} y={1200} w={780} h={500} reps={4} />
        <Rule x={950} y={500} w={2} t={1220} color="rgba(25,23,20,0.35)" />

        {/* col 2: the calendar */}
        <Abs x={1000} y={520} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.12em", color: INK }}>
          <TypeOn text="THE CALENDAR" at={c("next", 0, -8)} cps={40} />
        </Abs>
        <Tile x={990} y={600} month="OCT" day="26" what="FILE S-1" at={c("next", 0, -2)} rot={-3} hot />
        <Tile x={1300} y={640} month="NOV" day="9" what="ROADSHOW" at={c("with", 0, -2)} rot={2} />
        <Tile x={1610} y={600} month="NOV" day="MID" what="LISTING" at={c("listing", 0, -2)} rot={-2} hot />
        <MarkerLoop w={320} h={380} seed="oct26" stroke={8} progress={prog(f, c("week", 0, -4), c("week", 0, 10), OUT)} style={{ left: 955, top: 560 }} />
        <MarkerLoop w={320} h={380} seed="midnov" stroke={8} progress={prog(f, c("mid-November", 0, -2), c("mid-November", 0, 14), OUT)} style={{ left: 1575, top: 560 }} />
        <Scrawl text="next week" at={c("next", 0, 0)} dur={14} size={64} rot={-5} style={{ left: 1000, top: 960 }} />
        <InkPath d="M0,40 C120,0 300,10 420,40 C520,60 600,30 640,10" w={640} h={60} stroke={6} head progress={prog(f, c("with", 0, 0), c("mid-November", 0, 6), OUT)} style={{ left: 1120, top: 990 }} />
        <Copy x={1014} y={1120} w={820} h={580} />
      </div>
      <Rule x={1900} y={500} w={2} t={1220} color="rgba(25,23,20,0.35)" />

      {/* col 3: OpenAI */}
      <div style={{ position: "absolute", left: 1930, top: 480, width: 860, height: 1260, filter: blurR > 0.3 ? `blur(${blurR}px)` : undefined }}>
        <div style={{ position: "absolute", left: -1930, top: -480 }}>
          <Abs x={1960} y={520} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.16em", color: SPOT }}>
            <TypeOn text="OPENAI · REPORTEDLY" at={c("OpenAI", 0, -2)} cps={40} />
          </Abs>
          <Abs x={1956} y={572} w={820} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 92, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
            <CueWords words={[["Racing", c("racing")], ["to", c("to", 1)], ["raise", c("raise")], ["sovereign", c("sovereign")], ["money.", c("money")]]} gap="0.22em" wordStyle={(i) => (i === 0 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
          </Abs>
          <Stopwatch x={2000} y={800} w={460} />
          <Handwrite text="before the IPO" at={c("before", 0, -2)} dur={16} size={64} rot={-6} style={{ left: 2380, top: 860 }} />
          <InkPath d="M260,0 C180,40 90,60 0,50" w={260} h={60} stroke={7} head progress={prog(f, c("then", 0, -4), c("then", 0, 8), OUT)} style={{ left: 2420, top: 960 }} />
          <Copy x={1960} y={1340} w={800} h={360} reps={2} />
        </div>
      </div>
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 900, y: 370, s: 1.1 },
  { f: c("Anthropic", 0, 0), x: 900, y: 380, s: 1.08 },
  { f: c("file", 0, 8), x: 1080, y: 420, s: 0.94 },
  { f: c("IPO", 0, -10), x: 560, y: 820, s: 1.06 },
  { f: c("next", 0, -6), x: 1400, y: 800, s: 1.04 },
  { f: c("mid-November", 0, 12), x: 1410, y: 805, s: 1.07 },
  { f: c("OpenAI", 0, -2), x: 2080, y: 820, s: 0.96 },
  { f: c("racing", 0, 2), x: 2130, y: 860, s: 1.04 },
  { f: c("then", 0, 2), x: 2140, y: 870, s: 1.06 },
  { f: c("then", 0, 26), x: 1330, y: 860, s: 0.78 },
];

export const S4Listing: React.FC = () => (
  <AbsoluteFill style={{ background: "#2a2019", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, perspective: 1700, perspectiveOrigin: "50% 22%" }}>
      <div style={{ position: "absolute", left: -320, top: -300, width: 2560, height: 1700, transform: "rotateX(16deg) rotateZ(-2deg)", transformOrigin: "50% 60%" }}>
        <Camera keys={KEYS} vw={2560} vh={1700}>
          <div style={{ position: "absolute", left: -1200, top: -1000, width: 5200, height: 3800, background: "radial-gradient(ellipse at 50% 40%, #3a2c22, #1e1712 70%)" }} />
          <Page />
          <Tape x={700} y={500} rot={8} w={150} h={44} />
        </Camera>
      </div>
    </div>
    {/* shallow depth of field */}
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 340, backdropFilter: "blur(7px)", WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)", maskImage: "linear-gradient(180deg, #000 0%, #000 25%, transparent 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, backdropFilter: "blur(4px)", WebkitMaskImage: "linear-gradient(0deg, #000 0%, transparent 100%)", maskImage: "linear-gradient(0deg, #000 0%, transparent 100%)" }} />
  </AbsoluteFill>
);

