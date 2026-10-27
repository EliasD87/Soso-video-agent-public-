import React from "react";
import { interpolate } from "remotion";
import { clamp, OUT, pop, useF } from "./motion";
import { MONO } from "./tokens";

const hidden: React.CSSProperties = { visibility: "hidden" };

// A word or block that stamps onto the paper: comes down from above the sheet and lands hard.
export const Stamp: React.FC<{
  at: number;
  children: React.ReactNode;
  from?: number;
  rot?: number;
  style?: React.CSSProperties;
}> = ({ at, children, from = 1.55, rot = 0, style }) => {
  const f = useF();
  if (f < at) return <span style={{ display: "inline-block", ...style, ...hidden }}>{children}</span>;
  const p = pop(f, at, 15, 340, 0.6);
  const s = from + (1 - from) * p;
  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${s}) rotate(${rot * (1 - p)}deg)`,
        opacity: Math.min(1, (f - at + 1) / 3),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// Words that print on their spoken cue, each stamping in.
export const CueWords: React.FC<{
  words: [string, number][];
  gap?: string;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties | undefined;
}> = ({ words, gap = "0.24em", style, wordStyle }) => (
  <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: gap, ...style }}>
    {words.map(([w, at], i) => (
      <Stamp key={i} at={at} style={wordStyle?.(i)}>
        {w}
      </Stamp>
    ))}
  </span>
);

// Letters that spring up from below the baseline one after another (the "J-o-e" move).
export const Letters: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  rise?: number;
  style?: React.CSSProperties;
  letterStyle?: React.CSSProperties;
}> = ({ text, at, stagger = 2, rise = 0.55, style, letterStyle }) => {
  const f = useF();
  return (
    <span style={{ display: "inline-flex", ...style }}>
      {[...text].map((ch, i) => {
        const t0 = at + i * stagger;
        const p = pop(f, t0, 10, 190, 0.7);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              transform: `translateY(${(1 - p) * rise}em) rotate(${(1 - p) * (i % 2 ? 9 : -9)}deg)`,
              opacity: f < t0 ? 0 : Math.min(1, (f - t0 + 1) / 3),
              ...letterStyle,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

// Typewriter: characters strike one by one at `cps`, with a block caret while typing.
export const TypeOn: React.FC<{
  text: string;
  at: number;
  cps?: number;
  style?: React.CSSProperties;
  caret?: boolean;
}> = ({ text, at, cps = 30, style, caret = true }) => {
  const f = useF();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - at) * cps) / 30)));
  const typing = f >= at && n < text.length;
  return (
    <span style={{ fontFamily: MONO, whiteSpace: "pre", ...style }}>
      <span>{text.slice(0, n)}</span>
      {caret && typing ? <span style={{ opacity: 0.8 }}>▌</span> : null}
      <span style={{ visibility: "hidden" }}>{text.slice(typing && caret ? n + 1 : n)}</span>
    </span>
  );
};

// Number that runs up to its value on an expo-out curve.
export const CountUp: React.FC<{
  at: number;
  dur: number;
  from?: number;
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  comma?: boolean;
  style?: React.CSSProperties;
}> = ({ at, dur, from = 0, to, decimals = 0, prefix = "", suffix = "", comma = false, style }) => {
  const f = useF();
  const v = interpolate(f, [at, at + dur], [from, to], { ...clamp, easing: OUT });
  const s = comma
    ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : v.toFixed(decimals);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {s}
      {suffix}
    </span>
  );
};
