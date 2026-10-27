import React from "react";
import { AbsoluteFill, Img, random, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, MarkerLoop, Tape } from "../design/Hand";
import { IN, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, Stamp, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT } from "../design/tokens";
import { cue } from "../cues";

// 05 · Models — GPT-6.1 Terra prints big, "3×" stamps under it and "faster" is written on. A rate card
// lands with the new API prices per million tokens; the price column is ringed and "half the price"
// written beside it. Across the desk, Kimi's compute tray: "rate limits" is written over it, then sub-agent
// call slips rain in, pile up past the rim and spill onto the desk, and "overloaded" is written.
// "OpenAI's GPT six point one Terra is three times faster at half the API price. Kimi's new model hit
//  rate limits, as excessive sub-agent calls overloaded its compute."
const c = (w: string, nth = 0, off = 0) => cue(4, w, nth, off);

const mono: React.CSSProperties = { fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: INK };

const CARD = { x: 110, y: 540, w: 880, h: 380 };
const PRICES: [string, string][] = [
  ["Input", "$1"],
  ["Cached input", "$0.05"],
  ["Output", "$5"],
];

const RateCard: React.FC = () => {
  const f = useF();
  const s = slap(f, c("at", 0, -6), -1, 1.15);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter, boxShadow: `inset 0 0 0 10px #fbf8ef, inset 0 0 0 13px ${INK}, inset 0 0 0 18px #fbf8ef, inset 0 0 0 20px ${INK}` }}>
      <div style={{ position: "absolute", left: 50, top: 46, ...mono }}>API PRICE · PER MILLION TOKENS</div>
      {PRICES.map(([k, v], i) => (
        <React.Fragment key={k}>
          <div style={{ position: "absolute", left: 50, top: 108 + i * 82, fontFamily: SERIF, fontWeight: 900, fontSize: 54, letterSpacing: "-0.02em", color: INK }}>
            <TypeOn text={k} at={c("at", 0, -2) + i * 4} cps={40} caret={false} style={{ fontFamily: SERIF }} />
          </div>
          <div style={{ position: "absolute", left: 470, top: 136 + i * 82, width: 180, borderTop: "3px dotted rgba(25,23,20,0.45)" }} />
          <div style={{ position: "absolute", left: 670, top: 108 + i * 82, width: 160, textAlign: "right", fontFamily: SERIF, fontWeight: 900, fontSize: 56, color: INK, opacity: prog(f, c("half", 0, -6) + i * 2, c("half", 0, -2) + i * 2) }}>
            {v}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ── sub-agent call slips raining into the tray ──
const N = 40;
const TRAY = { x: 2050, y: 420, w: 860 };
const slips = [...Array(N)].map((_, i) => {
  const inside = i < 24;
  const x = inside ? 2180 + random(`sx${i}`) * 520 : 1960 + random(`sx${i}`) * 1060;
  const y = inside ? 640 - i * 7 + random(`sy${i}`) * 90 : 790 + random(`sy${i}`) * 80;
  return { x, y, r: (random(`sr${i}`) - 0.5) * 70, n: 100 + Math.floor(random(`sn${i}`) * 900) };
});

const Slips: React.FC = () => {
  const f = useF();
  const a = c("excessive", 0, -4);
  const b = c("compute", 0, 0);
  return (
    <>
      {slips.map((s, i) => {
        const at = a + (i / N) * (b - a);
        const q = prog(f, at - 9, at, IN);
        if (q <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: s.x,
              top: s.y - (1 - q) * 900,
              width: 170,
              height: 92,
              background: i % 5 === 0 ? "#f3e2b8" : "#fbf8ef",
              transform: `rotate(${s.r + (1 - q) * 50}deg)`,
              boxShadow: "0 6px 8px rgba(40,24,8,0.25)",
              padding: "12px 14px",
            }}
          >
            <div style={{ ...mono, fontSize: 15, letterSpacing: "0.12em" }}>SUB-AGENT CALL</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 32, color: INK, lineHeight: 1.2 }}>#{s.n}</div>
          </div>
        );
      })}
    </>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 900, y: 520, s: 1.04 },
  { f: c("OpenAI's"), x: 900, y: 520, s: 1.02 },
  { f: c("price", 0, 0), x: 920, y: 530, s: 1.0 },
  { f: c("Kimi's", 0, 10), x: 2460, y: 540, s: 1.0 },
  { f: c("compute", 0, 40), x: 2470, y: 545, s: 1.02 },
];

export const S5Models: React.FC = () => {
  const f = useF();
  const tray = slap(f, c("Kimi's", 0, -2), 0, 1.12);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -400, top: -300, width: 4000, height: 1700 }}>
          <Paper />
        </div>

        {/* ── GPT-6.1 Terra ── */}
        <Abs x={110} y={104} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="OPENAI · NEW MODEL" at={c("OpenAI's", 0, -6)} cps={44} />
        </Abs>
        <div style={{ position: "absolute", left: 100, top: 144, fontFamily: SERIF, fontWeight: 900, fontSize: 112, lineHeight: 1, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
          <CueWords words={[["GPT-6.1", c("GPT")], ["Terra", c("Terra")]]} wordStyle={(i) => (i === 1 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </div>
        <Abs x={104} y={268} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 230, lineHeight: 1, letterSpacing: "-0.05em", color: INK }}>
          <Stamp at={c("three", 0, -2)}>3×</Stamp>
        </Abs>
        <Handwrite text="faster" at={c("faster", 0, -4)} dur={12} size={120} rot={-5} underline style={{ left: 470, top: 330 }} />
        <RateCard />
        <MarkerLoop w={250} h={300} seed="prices" progress={prog(f, c("half", 0, 0), c("API", 0, 6))} style={{ left: 760, top: 630 }} />
        <Handwrite text="half the price" at={c("half", 0, -2)} dur={16} size={84} rot={-6} style={{ left: 1030, top: 620 }} />

        {/* ── Kimi's compute tray ── */}
        <Abs x={1870} y={104} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="KIMI · NEW MODEL" at={c("Kimi's", 0, -6)} cps={44} />
        </Abs>
        <Handwrite text="rate limits" at={c("rate", 0, -2)} dur={14} size={124} rot={-4} underline style={{ left: 1860, top: 150 }} />
        {tray.visible ? (
          <Img src={staticFile("scenes/tray.png")} style={{ position: "absolute", left: TRAY.x, top: TRAY.y, width: TRAY.w, transform: tray.transform, opacity: tray.opacity, filter: tray.filter }} />
        ) : null}
        {tray.visible ? (
          <div style={{ position: "absolute", left: 2300, top: 830, padding: "8px 22px", background: CREAM, transform: "rotate(-2deg)", boxShadow: "0 4px 6px rgba(40,24,8,0.25)", ...mono, fontSize: 26, opacity: tray.opacity }}>
            COMPUTE
          </div>
        ) : null}
        {tray.visible ? <Tape x={2330} y={812} rot={4} w={120} h={36} opacity={tray.opacity} /> : null}
        <Slips />
        <Handwrite text="overloaded" at={c("overloaded", 0, -2)} dur={14} size={96} rot={-5} style={{ left: 2720, top: 320 }} />
      </Camera>
    </AbsoluteFill>
  );
};
