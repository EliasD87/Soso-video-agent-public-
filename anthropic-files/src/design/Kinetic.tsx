import React from "react";
import { interpolate, random } from "remotion";
import { clamp, EASE, OUT, pop, prog, useF } from "./motion";
import { CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "./tokens";

// ── Ransom: each letter cut from a different newspaper, popping on in sequence.
const FACES = [
  { fontFamily: SERIF, fontWeight: 900 },
  { fontFamily: SERIF, fontWeight: 900, fontStyle: "italic" as const },
  { fontFamily: TABLOID },
  { fontFamily: MONO, fontWeight: 600 },
];
const CHIPS = [
  { background: CREAM, color: INK },
  { background: INK, color: CREAM },
  { background: SPOT, color: CREAM },
  { background: "#e6dcc4", color: INK },
];
export const Ransom: React.FC<{ text: string; at: number; size: number; seed: string; stagger?: number; style?: React.CSSProperties }> = ({ text, at, size, seed, stagger = 2, style }) => {
  const f = useF();
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.06, ...style }}>
      {[...text].map((ch, i) => {
        if (ch === " ") return <span key={i} style={{ width: size * 0.3 }} />;
        const t0 = at + i * stagger;
        const p = pop(f, t0, 11, 260, 0.6);
        const face = FACES[Math.floor(random(`${seed}f${i}`) * FACES.length)];
        const chip = CHIPS[Math.floor(random(`${seed}c${i}`) * CHIPS.length)];
        const sz = size * (0.86 + random(`${seed}s${i}`) * 0.28);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              ...face,
              ...chip,
              fontSize: sz,
              lineHeight: 1,
              padding: `${sz * 0.07}px ${sz * 0.11}px ${sz * 0.03}px`,
              transform: `translateY(${(random(`${seed}y${i}`) - 0.5) * size * 0.12}px) rotate(${(random(`${seed}r${i}`) - 0.5) * 12 + (1 - p) * 30}deg) scale(${p})`,
              boxShadow: "0 4px 6px rgba(40,24,8,0.25)",
              visibility: f < t0 ? "hidden" : "visible",
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// ── Wobble: letters on springs, kicked on their cue and never quite settling.
export const Wobble: React.FC<{ text: string; at: number; style?: React.CSSProperties }> = ({ text, at, style }) => {
  const f = useF();
  return (
    <span style={{ display: "inline-flex", ...style }}>
      {[...text].map((ch, i) => {
        const t = f - at - i * 2;
        const on = t >= 0;
        const amp = on ? 14 * Math.exp(-t / 24) + 3 : 0;
        const r = on ? Math.sin(t * 0.42 + i * 1.3) * amp : 0;
        const y = on ? Math.sin(t * 0.31 + i * 2.1) * amp * 0.5 : 0;
        return (
          <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transformOrigin: "50% 90%", transform: `translateY(${y}px) rotate(${r}deg) scale(${pop(f, at + i * 2, 9, 260)})` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// ── TearWord: one word torn down the middle; the halves pull apart on `tearAt`.
const TEAR: [number, number][] = [[50, -6], [46, 10], [54, 22], [47, 36], [55, 50], [46, 63], [53, 77], [47, 90], [51, 106]];
const half = (side: "l" | "r") => `polygon(${side === "l" ? "-6% -6%" : "106% -6%"}, ${TEAR.map(([x, y]) => `${x}% ${y}%`).join(", ")}, ${side === "l" ? "-6% 106%" : "106% 106%"})`;
export const TearWord: React.FC<{ children: React.ReactNode; at: number; tearAt: number; gap?: number; style?: React.CSSProperties }> = ({ children, at, tearAt, gap = 40, style }) => {
  const f = useF();
  const p = pop(f, tearAt, 12, 140, 0.9);
  return (
    <span style={{ position: "relative", display: "inline-block", opacity: prog(f, at, at + 4), marginRight: gap, ...style }}>
      <span style={{ display: "inline-block", clipPath: half("l"), transform: `translate(${-gap * p}px, ${-6 * p}px) rotate(${-2.2 * p}deg)` }}>{children}</span>
      <span style={{ position: "absolute", left: 0, top: 0, clipPath: half("r"), transform: `translate(${gap * p}px, ${8 * p}px) rotate(${2.4 * p}deg)` }}>{children}</span>
    </span>
  );
};

// ── Odometer: a counter wheel printed on card, spins and lands on `digit`.
export const Odometer: React.FC<{ spinAt: number; landAt: number; digit: number; size: number; color?: string; turns?: number; font?: string }> = ({
  spinAt,
  landAt,
  digit,
  size,
  color = INK,
  turns = 4,
  font = SERIF,
}) => {
  const f = useF();
  const target = turns * 10 + digit;
  const v = interpolate(f, [spinAt, landAt], [digit + 3, target], { ...clamp, easing: OUT });
  const settle = f > landAt ? Math.sin((f - landAt) * 0.9) * Math.exp(-(f - landAt) / 4) * 0.12 : 0;
  const pos = (((v + settle) % 10) + 10) % 10;
  const speed = Math.abs(interpolate(f + 1, [spinAt, landAt], [digit + 3, target], { ...clamp, easing: OUT }) - v);
  const h = size * 1.12;
  return (
    <div style={{ position: "relative", width: size * 0.7, height: h, overflow: "hidden", background: CREAM, boxShadow: "inset 0 16px 18px rgba(40,24,8,0.35), inset 0 -16px 18px rgba(40,24,8,0.35), 0 6px 10px rgba(40,24,8,0.25)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: -pos * h, filter: speed > 0.05 ? `blur(${Math.min(10, speed * 22)}px)` : undefined }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ height: h, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, fontWeight: 900, fontSize: size, color, lineHeight: 1 }}>
            {i % 10}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Receipt: a till pushes cream paper up out of its slot; each line prints at the slot.
export const Receipt: React.FC<{ lines: { text: string; at: number; big?: boolean; color?: string }[]; width: number }> = ({ lines, width }) => {
  const f = useF();
  const LH = 52;
  const BIG = 124;
  const hOf = (l: { big?: boolean }) => (l.big ? BIG : LH);
  const fed = lines.map((l) => prog(f, l.at, l.at + 5, EASE));
  const started = fed[0] > 0;
  const total = lines.reduce((a, l, i) => a + hOf(l) * fed[i], 0) + (started ? 30 : 0);
  return (
    <div style={{ position: "relative", width, height: 0 }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width,
          height: total,
          background: "#fbf8ef",
          boxShadow: "0 -6px 16px rgba(40,24,8,0.16)",
          clipPath: `polygon(0 12px, ${[...Array(16)].map((_, i) => `${(i + 0.5) * 6.25}% ${i % 2 ? "12px" : "0px"}`).join(", ")}, 100% 12px, 100% 100%, 0 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 30, flexShrink: 0 }} />
        {lines.map((l, i) =>
          fed[i] > 0 ? (
            <div key={i} style={{ height: hOf(l) * fed[i], flexShrink: 0, overflow: "hidden", paddingLeft: 24 }}>
              <div style={{ height: hOf(l), display: "flex", alignItems: "center", fontFamily: l.big ? SERIF : MONO, fontWeight: l.big ? 900 : 600, fontSize: l.big ? 104 : 28, letterSpacing: l.big ? "-0.02em" : "0.06em", color: l.color ?? INK, whiteSpace: "pre" }}>
                {l.text}
              </div>
            </div>
          ) : null,
        )}
      </div>
      <div style={{ position: "absolute", left: -26, right: -26, top: -4, height: 66, background: INK, borderRadius: 8, boxShadow: "0 10px 16px rgba(0,0,0,0.3)" }}>
        <div style={{ position: "absolute", left: 20, right: 20, top: 0, height: 8, background: "#000", borderRadius: 3 }} />
        <div style={{ position: "absolute", right: 24, bottom: 18, width: 12, height: 12, borderRadius: 6, background: started ? SPOT : "#3a332c" }} />
      </div>
    </div>
  );
};
