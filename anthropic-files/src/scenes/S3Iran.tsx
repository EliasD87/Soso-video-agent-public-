import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, MarkerLoop, Tape } from "../design/Hand";
import { boil, EASE, OUT, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 03 · Deadlock — two boom barriers face each other across the frame: Iran's says HORMUZ, the US one
// BLOCKADE. On "who moves first" each twitches up and drops back; Iran's lifts a little further on
// "reopening Hormuz" and falls again, then the US one does the same on "lifting its blockade". Neither
// stays up. The camera runs on to a halftone clipping of the burning Saudi pipeline, ringed on "hit",
// and a Brent gauge whose needle swings to 115 and holds there.
// "US-Iran talks are deadlocked over who moves first: Iran reopening Hormuz, or the US lifting its
//  blockade. Houthis hit a Saudi pipeline, and Brent held at a hundred and fifteen."
const c = (w: string, nth = 0, off = 0) => cue(2, w, nth, off);

// A boom lifts by `amp` degrees and falls back, with a small bounce when it lands.
const bump = (f: number, at: number, amp: number) => {
  const up = prog(f, at, at + 7, OUT);
  const down = prog(f, at + 16, at + 26, EASE);
  const land = f > at + 26 ? Math.sin((f - at - 26) * 0.9) * Math.exp(-(f - at - 26) / 5) * 1.6 : 0;
  return amp * (up - down) + (f > at + 26 ? Math.max(0, land) : 0);
};

const POST_Y = 540;
const BOOM_W = 650;

const Boom: React.FC<{ side: "l" | "r"; label: string; angle: number }> = ({ side, label, angle }) => {
  const px = side === "l" ? 150 : 1560;
  return (
    <>
      <div style={{ position: "absolute", left: px, top: POST_Y, width: 46, height: 380, background: INK, boxShadow: "0 10px 14px rgba(40,24,8,0.3)" }} />
      <div style={{ position: "absolute", left: px - 22, top: POST_Y + 360, width: 90, height: 26, background: INK }} />
      <div
        style={{
          position: "absolute",
          left: side === "l" ? px + 23 : px + 23 - BOOM_W,
          top: POST_Y + 6,
          width: BOOM_W,
          height: 48,
          transformOrigin: side === "l" ? "0% 50%" : "100% 50%",
          transform: `rotate(${side === "l" ? -angle : angle}deg)`,
          background: `repeating-linear-gradient(-45deg, ${SPOT} 0 34px, ${CREAM} 34px 68px)`,
          border: `3px solid ${INK}`,
          borderRadius: 6,
          boxShadow: "0 10px 14px rgba(40,24,8,0.28)",
        }}
      >
        <div style={{ position: "absolute", left: "50%", top: 4, transform: "translateX(-50%)", padding: "2px 14px", background: CREAM, fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: INK, whiteSpace: "nowrap" }}>
          {label}
        </div>
      </div>
      <div style={{ position: "absolute", left: px - 10, top: POST_Y - 10, width: 66, height: 66, borderRadius: 33, background: INK }} />
    </>
  );
};

// ── the Brent gauge ──
const G = { cx: 3420, cy: 440, r: 250 };
const angOf = (v: number) => -135 + ((v - 90) / 40) * 270; // 0 = straight up, clockwise

const Gauge: React.FC = () => {
  const f = useF();
  const s = slap(f, c("and", 0, -8), 0, 1.12);
  if (!s.visible) return null;
  const sweep = prog(f, c("Brent", 0, -4), c("held", 0, 0), OUT);
  const t = f - c("held", 0, 0);
  const quiver = t > 0 ? Math.sin(t * 1.3) * 0.7 * Math.exp(-t / 18) : 0;
  const v = 90 + 25 * sweep + quiver;
  const ticks = [...Array(41)].map((_, i) => 90 + i);
  return (
    <div style={{ position: "absolute", left: G.cx - G.r, top: G.cy - G.r, width: G.r * 2, height: G.r * 2, transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: G.r, background: "#fbf8ef", boxShadow: `inset 0 0 0 10px ${INK}, inset 0 0 0 16px #fbf8ef, inset 0 0 0 18px rgba(25,23,20,0.4)` }} />
      {ticks.map((tv) => {
        const big = tv % 10 === 0;
        const a = (angOf(tv) * Math.PI) / 180;
        const r1 = G.r - 30;
        const r0 = r1 - (big ? 34 : tv % 5 === 0 ? 22 : 12);
        return (
          <div
            key={tv}
            style={{
              position: "absolute",
              left: G.r + Math.sin(a) * r0,
              top: G.r - Math.cos(a) * r0,
              width: big ? 6 : 3,
              height: r1 - r0,
              background: tv === 115 ? SPOT : INK,
              transformOrigin: "50% 0%",
              transform: `translateX(-50%) rotate(${180 + angOf(tv)}deg)`,
            }}
          />
        );
      })}
      {[90, 100, 110, 120, 130].map((tv) => {
        const a = (angOf(tv) * Math.PI) / 180;
        const r = G.r - 100;
        return (
          <div key={tv} style={{ position: "absolute", left: G.r + Math.sin(a) * r - 50, top: G.r - Math.cos(a) * r - 24, width: 100, textAlign: "center", fontFamily: TABLOID, fontSize: 44, lineHeight: "48px", color: INK }}>
            {tv}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: G.r * 2 + 18, textAlign: "center", fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: INK }}>
        BRENT · $/BBL
      </div>
      <div style={{ position: "absolute", left: G.r - 5, top: G.r - (G.r - 50), width: 10, height: G.r - 50 + 30, background: SPOT, borderRadius: 5, transformOrigin: `50% ${G.r - 50}px`, transform: `rotate(${angOf(v)}deg)`, boxShadow: "0 4px 6px rgba(40,24,8,0.35)" }} />
      <div style={{ position: "absolute", left: G.r - 26, top: G.r - 26, width: 52, height: 52, borderRadius: 26, background: INK }} />
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 900, y: 540, s: 1.03 },
  { f: c("US-Iran"), x: 900, y: 540, s: 1.02 },
  { f: c("blockade", 0, 4), x: 910, y: 550, s: 1.0 },
  { f: c("Houthis", 0, 10), x: 2860, y: 500, s: 1.0 },
  { f: c("fifteen", 0, 30), x: 2870, y: 505, s: 1.01 },
];

export const S3Iran: React.FC = () => {
  const f = useF();
  const iran = bump(f, c("who", 0, 0), 7) + bump(f, c("reopening", 0, -4), 13) + bump(f, c("blockade", 0, 6), 4);
  const us = bump(f, c("moves", 0, 2), 7) + bump(f, c("lifting", 0, -4), 13) + bump(f, c("blockade", 0, 12), 4);
  const clip = slap(f, c("Houthis", 0, -6), -1.5, 1.12);
  const cb = boil(f, "pipeClip", 0.6);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -400, top: -300, width: 4400, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the standoff ── */}
        <Abs x={110} y={104} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="WASHINGTON · TEHRAN" at={c("US-Iran", 0, -6)} cps={44} />
        </Abs>
        <div style={{ position: "absolute", left: 100, top: 144, fontFamily: SERIF, fontWeight: 900, fontSize: 104, lineHeight: 0.98, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
          <CueWords words={[["US–Iran", c("US-Iran")], ["talks", c("talks")], ["are", c("are")]]} gap="0.22em" />
          <div>
            <CueWords words={[["deadlocked.", c("deadlocked")]]} wordStyle={() => ({ color: SPOT, fontStyle: "italic" })} />
          </div>
        </div>
        <Handwrite text="who moves first?" at={c("who", 0, -2)} dur={16} size={78} color={INK} rot={-3} style={{ left: 900, top: 276 }} />

        <Boom side="l" label="HORMUZ" angle={iran} />
        <Boom side="r" label="BLOCKADE" angle={us} />

        <Abs x={240} y={650} style={{ fontFamily: TABLOID, fontSize: 88, lineHeight: 1, color: INK, opacity: prog(f, c("Iran", 0, -6), c("Iran", 0, 0)) }}>
          IRAN
        </Abs>
        <Abs x={242} y={760} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 52, letterSpacing: "-0.02em", color: INK }}>
          <TypeOn text="reopening Hormuz" at={c("reopening", 0, -4)} cps={34} caret={false} style={{ fontFamily: SERIF }} />
        </Abs>
        <Abs x={1100} y={650} w={420} style={{ textAlign: "right", fontFamily: TABLOID, fontSize: 88, lineHeight: 1, color: INK, opacity: prog(f, c("US", 0, -6), c("US", 0, 0)) }}>
          US
        </Abs>
        <Abs x={880} y={760} w={640} style={{ textAlign: "right", fontFamily: SERIF, fontWeight: 900, fontSize: 52, letterSpacing: "-0.02em", color: INK }}>
          <TypeOn text="lifting its blockade" at={c("lifting", 0, -4)} cps={34} caret={false} style={{ fontFamily: SERIF }} />
        </Abs>

        {/* ── the pipeline ── */}
        {clip.visible ? (
          <div style={{ position: "absolute", left: 2040 + cb.x, top: 140 + cb.y, width: 1000, transform: `${clip.transform} rotate(${cb.r}deg)`, opacity: clip.opacity, filter: clip.filter }}>
            <Img src={staticFile("scenes/pipeline.png")} style={{ width: 1000, display: "block" }} />
            <Tape x={420} y={-20} rot={-3} w={150} h={42} />
          </div>
        ) : null}
        <MarkerLoop w={540} h={360} seed="smoke" progress={prog(f, c("hit", 0, -2), c("hit", 0, 14))} style={{ left: 2470, top: 110 }} />
        <Handwrite text="Houthis hit" at={c("Houthis", 0, -2)} dur={14} size={92} rot={-4} underline style={{ left: 2080, top: 720 }} />
        <Abs x={2090} y={880} style={{ fontSize: 26, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="SAUDI PIPELINE" at={c("Saudi", 0, -4)} cps={40} caret={false} />
        </Abs>

        {/* ── Brent holds ── */}
        <Gauge />
        <Handwrite text="held at $115" at={c("held", 0, -2)} dur={14} size={80} rot={-4} underline style={{ left: 3140, top: 800 }} />
      </Camera>
    </AbsoluteFill>
  );
};
