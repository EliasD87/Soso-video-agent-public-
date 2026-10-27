import React from "react";
import { random } from "remotion";
import { prog, slap, useF, OUT } from "./motion";
import { CREAM, MARKER, SPOT, TABLOID } from "./tokens";

// Hand-drawn marker loop: an ellipse that overshoots its start, radius wobbling like a real pen.
export const loopPath = (w: number, h: number, seed: string, turns = 1.18, steps = 90): string => {
  const cx = w / 2;
  const cy = h / 2;
  const start = -2.4 + random(seed) * 0.4;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + t * turns * Math.PI * 2;
    const wob = 1 + 0.035 * Math.sin(a * 3 + random(seed + "w") * 6) + (t - 0.5) * 0.16;
    const x = cx + Math.cos(a) * (w / 2) * wob + t * w * 0.03;
    const y = cy + Math.sin(a) * (h / 2) * wob - t * h * 0.09;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Any marker stroke, drawn on to `progress` (0-1), with a slightly rough pen edge.
export const InkPath: React.FC<{
  d: string;
  w: number;
  h: number;
  progress?: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
  head?: boolean; // arrowhead at the end of the path
}> = ({ d, w, h, progress = 1, color = SPOT, stroke = 7, style, head = false }) => {
  const pad = stroke * 3;
  const id = React.useId().replace(/:/g, "");
  if (progress <= 0) return null; // nothing drawn yet: no round-cap dot
  return (
    <svg
      width={w + pad * 2}
      height={h + pad * 2}
      viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
      style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}
    >
      <defs>
        <marker id={`ah${id}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse">
          <path d="M0,0.6 L9,5 L0,9.4" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0.0001, progress)}
        markerEnd={head && progress > 0.97 ? `url(#ah${id})` : undefined}
        style={{ filter: "url(#marker-rough)" }}
      />
    </svg>
  );
};

export const MarkerLoop: React.FC<{
  w: number;
  h: number;
  seed: string;
  color?: string;
  stroke?: number;
  progress?: number;
  style?: React.CSSProperties;
}> = ({ w, h, seed, color = SPOT, stroke = 7, progress = 1, style }) => (
  <InkPath d={loopPath(w, h, seed)} w={w} h={h} progress={progress} color={color} stroke={stroke} style={style} />
);

// Handwriting: a marker line written left to right over `dur` frames.
export const Scrawl: React.FC<{
  text: string;
  at: number;
  dur?: number;
  size?: number;
  color?: string;
  rot?: number;
  style?: React.CSSProperties;
}> = ({ text, at, dur = 14, size = 56, color = SPOT, rot = -4, style }) => {
  const f = useF();
  const p = prog(f, at, at + dur, OUT);
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: MARKER,
        fontSize: size,
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        transform: `rotate(${rot}deg)`,
        clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Highlighter swipe across printed words: grows left to right, multiplies into the ink.
export const Highlight: React.FC<{
  w: number;
  h: number;
  progress: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ w, h, progress, color = "#ffd23f", style }) => (
  <div
    style={{
      position: "absolute",
      width: w * progress,
      height: h,
      background: color,
      mixBlendMode: "multiply",
      opacity: 0.85,
      borderRadius: `${h * 0.18}px ${h * 0.35}px ${h * 0.22}px ${h * 0.3}px`,
      transform: "rotate(-0.8deg) skewX(-6deg)",
      ...style,
    }}
  />
);

// Rubber stamp in spot ink: double rule box, slammed down at an angle, patchy ink.
export const RubberStamp: React.FC<{
  text: string;
  at: number;
  rot?: number;
  size?: number;
  color?: string;
  blend?: React.CSSProperties["mixBlendMode"];
  style?: React.CSSProperties;
}> = ({ text, at, rot = -7, size = 74, color = SPOT, blend = "multiply", style }) => {
  const f = useF();
  const s = slap(f, at, rot, 1.6);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", transform: s.transform, opacity: s.opacity, ...style }}>
      <div
        style={{
          border: `${Math.round(size * 0.09)}px solid ${color}`,
          outline: `${Math.round(size * 0.035)}px solid ${color}`,
          outlineOffset: Math.round(size * 0.08),
          padding: `${size * 0.1}px ${size * 0.3}px ${size * 0.06}px`,
          color,
          fontFamily: TABLOID,
          fontSize: size,
          lineHeight: 1.05,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          filter: "url(#stamp-ink)",
          mixBlendMode: blend,
        }}
      >
        {text}
      </div>
    </div>
  );
};

// Brush stroke painted on left to right (soft wet leading edge).
export const BrushPaint: React.FC<{
  src: string;
  w: number;
  progress: number;
  style?: React.CSSProperties;
}> = ({ src, w, progress, style }) => {
  const p = progress * 104;
  return (
    <img
      src={src}
      style={{
        position: "absolute",
        width: w,
        WebkitMaskImage: `linear-gradient(90deg, #000 ${p - 6}%, transparent ${p}%)`,
        maskImage: `linear-gradient(90deg, #000 ${p - 6}%, transparent ${p}%)`,
        ...style,
      }}
    />
  );
};

// Masking tape strip with torn ends.
export const Tape: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; opacity?: number }> = ({
  x,
  y,
  w = 150,
  h = 46,
  rot = 0,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      opacity,
      transform: `rotate(${rot}deg)`,
      background: "linear-gradient(180deg, rgba(236,226,196,0.86), rgba(222,210,176,0.82))",
      clipPath:
        "polygon(0% 8%, 4% 0%, 8% 10%, 12% 2%, 96% 4%, 100% 14%, 97% 30%, 100% 48%, 96% 66%, 100% 86%, 95% 100%, 6% 96%, 2% 88%, 5% 70%, 0% 52%, 4% 34%)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    }}
  />
);

// A label written on by hand in marker (used instead of a rubber stamp): the words are written left to
// right, with a thin paper halo so they stay readable over photos and dark ink; optionally underlined.
export const Handwrite: React.FC<{
  text: string;
  at: number;
  dur?: number;
  size?: number;
  color?: string;
  halo?: string | null;
  rot?: number;
  underline?: boolean;
  style?: React.CSSProperties;
}> = ({ text, at, dur = 16, size = 96, color = SPOT, halo = CREAM, rot = -5, underline = false, style }) => {
  const f = useF();
  if (f < at) return null;
  const p = prog(f, at, at + dur, OUT);
  const r = Math.max(2, size * 0.05);
  const shadow = halo
    ? [...Array(12)].map((_, i) => `${(Math.cos((i / 12) * Math.PI * 2) * r).toFixed(1)}px ${(Math.sin((i / 12) * Math.PI * 2) * r).toFixed(1)}px 0 ${halo}`).join(", ") + ", 0 8px 12px rgba(40,24,8,0.28)"
    : undefined;
  const w = text.length * size * 0.6;
  return (
    <div style={{ position: "absolute", transform: `rotate(${rot}deg)`, ...style }}>
      <div style={{ fontFamily: MARKER, fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap", textShadow: shadow, clipPath: `inset(-30% ${(1 - p) * 100}% -30% -10%)` }}>{text}</div>
      {underline ? (
        <InkPath d={`M0,8 C${w * 0.3},2 ${w * 0.65},13 ${w},4`} w={w} h={14} stroke={Math.max(6, size * 0.07)} color={color} progress={prog(f, at + dur - 2, at + dur + 8, OUT)} style={{ left: 0, top: size * 1.02 }} />
      ) : null}
    </div>
  );
};
