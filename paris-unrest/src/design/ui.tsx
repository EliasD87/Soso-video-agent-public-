import React from "react";
import { Img, staticFile } from "remotion";
import { boil, slap, useF } from "./motion";
import { CREAM, INK } from "./tokens";

export const Abs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, rot = 0, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      transform: rot ? `rotate(${rot}deg)` : undefined,
      whiteSpace: w === undefined ? "nowrap" : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

// A cut-out or printed scrap: slaps down on its cue, then boils on threes like stop-motion.
export const Scrap: React.FC<{
  src: string;
  x: number;
  y: number;
  w: number;
  at: number;
  rot?: number;
  boilAmp?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({ src, x, y, w, at, rot = 0, boilAmp = 1.2, seed = src, style }) => {
  const f = useF();
  const s = slap(f, at, rot);
  if (!s.visible) return null;
  const b = boil(f, seed, boilAmp);
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: x + b.x,
        top: y + b.y,
        width: w,
        transform: `${s.transform} rotate(${b.r}deg)`,
        opacity: s.opacity,
        filter: s.filter,
        ...style,
      }}
    />
  );
};

// Cream card / clipping with a hint of curl shadow.
export const Card: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: number;
  bg?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, rot = 0, bg = CREAM, style, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      background: bg,
      transform: `rotate(${rot}deg)`,
      boxShadow: "0 14px 22px rgba(40,24,8,0.22), 0 2px 3px rgba(40,24,8,0.18)",
      ...style,
    }}
  >
    {children}
  </div>
);

// Graph-paper ground for hand-plotted charts.
export const GraphPaper: React.FC<{ w: number; h: number; cell?: number; style?: React.CSSProperties }> = ({
  w,
  h,
  cell = 40,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: h,
      background: `#f4efe2`,
      backgroundImage: `linear-gradient(rgba(60,110,140,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(60,110,140,0.22) 1px, transparent 1px), linear-gradient(rgba(60,110,140,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(60,110,140,0.12) 1px, transparent 1px)`,
      backgroundSize: `${cell * 5}px ${cell * 5}px, ${cell * 5}px ${cell * 5}px, ${cell}px ${cell}px, ${cell}px ${cell}px`,
      boxShadow: "0 14px 22px rgba(40,24,8,0.22)",
      ...style,
    }}
  />
);

export const Rule: React.FC<{ x: number; y: number; w: number; t?: number; color?: string; progress?: number }> = ({
  x,
  y,
  w,
  t = 3,
  color = INK,
  progress = 1,
}) => <div style={{ position: "absolute", left: x, top: y, width: w * progress, height: t, background: color }} />;
