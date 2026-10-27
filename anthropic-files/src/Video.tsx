import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Cover } from "./scenes/Cover";
import { S1Filing } from "./scenes/S1Filing";
import { S2Meta } from "./scenes/S2Meta";
import { S3Iran } from "./scenes/S3Iran";
import { S4Crypto } from "./scenes/S4Crypto";
import { S5Models } from "./scenes/S5Models";
import { S6Thesis } from "./scenes/S6Thesis";
import { S7Watch } from "./scenes/S7Watch";
import { S8EndCard } from "./scenes/S8EndCard";
import { InkDefs, PrintFinish } from "./design/Paper";
import { clamp, SceneClock } from "./design/motion";
import { Captions } from "./components/Captions";
import { Sfx } from "./components/Sfx";
import { INK } from "./design/tokens";
import { CUTS, POST, PRE, SRC, TOTAL } from "./timeline";
import { cue } from "./cues";

const TL = PRE + POST;

export const SCENES = [S1Filing, S2Meta, S3Iran, S4Crypto, S5Models, S6Thesis, S7Watch, S8EndCard];
type T = "brush" | "ink" | "tear" | "whip" | "whipL" | "drop" | "grid";
// Transition INTO scene i (0 = cover → S1). No two in a row repeat.
export const TRANS: T[] = ["brush", "ink", "whip", "grid", "tear", "drop", "whipL", "brush"];


const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Directional motion-blur filters, one per strength step.
const BlurDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      {Array.from({ length: 9 }).map((_, i) => (
        <React.Fragment key={i}>
          <filter id={`mbx${i}`} x="-10%" y="0%" width="120%" height="100%">
            <feGaussianBlur stdDeviation={`${i * 7} 0`} />
          </filter>
          <filter id={`mby${i}`} x="0%" y="-10%" width="100%" height="120%">
            <feGaussianBlur stdDeviation={`0 ${i * 7}`} />
          </filter>
        </React.Fragment>
      ))}
    </defs>
  </svg>
);

const BRUSH_W = 3700;
const brushLeft = (p: number) => -BRUSH_W + ease(p) * (1920 + BRUSH_W + 200);

const wave = (y: number, amp: number, phase: number) =>
  Array.from({ length: 25 })
    .map((_, i) => `${(i / 24) * 100}% ${y + Math.sin(i * 0.9 + phase) * amp}px`)
    .join(", ");

const TEAR: [number, number][] = [
  [930, -40], [968, 90], [940, 180], [985, 290], [952, 390], [1000, 500], [962, 610], [1010, 720], [975, 830], [1020, 940], [990, 1120],
];

// Wraps a scene: applies its entrance (by its own transition) and its exit (by the next one).
const Shell: React.FC<{ enter?: T; exit?: T; dur: number; children: React.ReactNode }> = ({ enter, exit, dur, children }) => {
  const lf = useCurrentFrame();
  const pin = enter ? interpolate(lf, [0, TL], [0, 1], clamp) : 1;
  const pout = exit ? interpolate(lf, [dur - TL, dur], [0, 1], clamp) : 0;
  const ei = ease(pin);
  const eo = ease(pout);
  const style: React.CSSProperties = { position: "absolute", inset: 0, overflow: "hidden" };
  const tf: string[] = [];
  let filter: string | undefined;

  if (pin < 1 && enter) {
    const k = Math.round(Math.sin(Math.PI * pin) * 8);
    if (enter === "whip") (tf.push(`translateX(${(1 - ei) * 1920}px)`), (filter = `url(#mbx${k})`));
    if (enter === "whipL") (tf.push(`translateX(${-(1 - ei) * 1920}px)`), (filter = `url(#mbx${k})`));
    if (enter === "drop") (tf.push(`translateY(${-(1 - ei) * 1080}px)`), (filter = `url(#mby${k})`));
    if (enter === "brush") style.clipPath = `inset(0 ${Math.max(0, 100 - ((brushLeft(pin) + 1300) / 1920) * 100)}% 0 0)`;
    if (enter === "ink") style.clipPath = `polygon(${wave(1080 * (1 - ei) - 60, 46 * (1 - ei) + 6, pin * 6)}, 100% 1200px, 0% 1200px)`;
    if (enter === "grid") {
      const tiles: string[] = [];
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 3; c++) {
          const order = [0, 4, 2, 5, 1, 3][r * 3 + c];
          const t = ease(interpolate(pin, [0.15 + order * 0.1, 0.55 + order * 0.08], [0, 1], clamp));
          const cx = 320 + c * 640;
          const cy = 270 + r * 540;
          const hw = 320 * t;
          const hh = 270 * t;
          if (t > 0) tiles.push(`M${cx - hw},${cy - hh} H${cx + hw} V${cy + hh} H${cx - hw} Z`);
        }
      style.clipPath = tiles.length ? `path('${tiles.join(" ")}')` : "inset(50%)";
    }
    if (enter === "tear") style.zIndex = 1;
  }

  if (pout > 0 && exit) {
    const k = Math.round(Math.sin(Math.PI * pout) * 8);
    if (exit === "whip") (tf.push(`translateX(${-eo * 1920}px)`), (filter = `url(#mbx${k})`));
    if (exit === "whipL") (tf.push(`translateX(${eo * 1920}px)`), (filter = `url(#mbx${k})`));
    if (exit === "drop") (tf.push(`translateY(${eo * 1080}px)`), (filter = `url(#mby${k})`));
    if (exit === "grid") (tf.push(`scale(${1 - eo * 0.05})`), (filter = `brightness(${1 - eo * 0.25})`));
    if (exit === "tear") {
      style.zIndex = 2;
      const pts = TEAR.map(([x, y]) => `${x}px ${y}px`);
      const leftPoly = `polygon(-40px -40px, ${pts.join(", ")}, -40px 1120px)`;
      const rightPoly = `polygon(1960px -40px, ${pts.join(", ")}, 1960px 1120px)`;
      const edge = TEAR.map(([x, y]) => `${x},${y}`).join(" ");
      return (
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          {(["l", "r"] as const).map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: side === "l" ? "0% 100%" : "100% 100%",
                transform:
                  side === "l"
                    ? `translate(${-eo * 1150}px, ${eo * 90}px) rotate(${-eo * 11}deg)`
                    : `translate(${eo * 1150}px, ${eo * 140}px) rotate(${eo * 13}deg)`,
                filter: `drop-shadow(0 ${10 + eo * 30}px ${14 + eo * 20}px rgba(30,18,6,0.35))`,
              }}
            >
              <div style={{ position: "absolute", inset: 0, clipPath: side === "l" ? leftPoly : rightPoly, overflow: "hidden" }}>
                <div style={style}>{children}</div>
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <polyline points={edge} fill="none" stroke="#f6f1e4" strokeWidth={18} strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      );
    }
  }

  return <div style={{ ...style, transform: tf.join(" ") || undefined, filter }}>{children}</div>;
};

const BrushSweep: React.FC = () => {
  const lf = useCurrentFrame();
  const p = interpolate(lf, [0, TL], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <Img src={staticFile("cover/brush.png")} style={{ position: "absolute", left: brushLeft(p), top: -420, width: BRUSH_W, height: 1920, transform: "rotate(-3deg)" }} />
    </AbsoluteFill>
  );
};

const GridLines: React.FC = () => {
  const lf = useCurrentFrame();
  const p = interpolate(lf, [0, TL * 0.55], [0, 1], clamp);
  const fade = interpolate(lf, [TL * 0.7, TL + 4], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fade }}>
      <div style={{ position: "absolute", left: 0, top: 539, width: 1920 * p, height: 3, background: INK }} />
      <div style={{ position: "absolute", left: 639, top: 0, width: 3, height: 1080 * p, background: INK }} />
      <div style={{ position: "absolute", left: 1279, top: 1080 * (1 - p), width: 3, height: 1080 * p, background: INK }} />
    </AbsoluteFill>
  );
};

const Furniture: React.FC = () => {
  const frame = useCurrentFrame();
  let idx = -1;
  CUTS.forEach((c, i) => {
    if (frame >= c) idx = i;
  });
  if (idx < 0) return null;
  const dark = idx === 5;
  const fadeIn = interpolate(frame, [CUTS[0], CUTS[0] + 12], [0, 1], clamp);
  // the corner logo steps aside while the ending is zoomed into the SoDEX screen
  const z0 = CUTS[7] + cue(7, "tech", 0, -28);
  const z1 = CUTS[7] + cue(7, "on", 0, 2);
  const away = interpolate(frame, [z0, z0 + 6], [0, 1], clamp) - interpolate(frame, [z1, z1 + 8], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: fadeIn * (1 - away) }}>
      <Img src={staticFile(dark ? "brand/sosovalue-logo.svg" : "brand/sosovalue-logo-dark.svg")} style={{ position: "absolute", left: 64, top: 40, height: 30 }} />
    </AbsoluteFill>
  );
};

const LiveCover: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + f * 0.0012})` }}>
      <Cover />
    </AbsoluteFill>
  );
};

export const AnthropicFiles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#e9e1cf" }}>
      <InkDefs />
      <BlurDefs />
      <Sequence from={0} durationInFrames={CUTS[0] + POST} name="Cover">
        <Shell exit={TRANS[0]} dur={CUTS[0] + POST}>
          <LiveCover />
        </Shell>
      </Sequence>
      {SCENES.map((Scene, i) => {
        const from = CUTS[i] - PRE;
        const to = i < SCENES.length - 1 ? CUTS[i + 1] + POST : TOTAL;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} name={`S${i + 1}`}>
            <SceneClock offset={PRE}>
              <Shell enter={TRANS[i]} exit={i < SCENES.length - 1 ? TRANS[i + 1] : undefined} dur={to - from}>
                <Scene />
              </Shell>
            </SceneClock>
          </Sequence>
        );
      })}
      {TRANS.map((t, i) =>
        t === "brush" ? (
          <Sequence key={`b${i}`} from={CUTS[i] - PRE} durationInFrames={TL} name={`brush→S${i + 1}`}>
            <BrushSweep />
          </Sequence>
        ) : t === "grid" ? (
          <Sequence key={`g${i}`} from={CUTS[i] - PRE} durationInFrames={TL + 4} name={`grid→S${i + 1}`}>
            <GridLines />
          </Sequence>
        ) : null,
      )}
      <Furniture />
      <Captions />
      {/* the print finish comes in with the first scene, so the cover reads exactly like the thumbnail */}
      <AbsoluteFill style={{ opacity: interpolate(frame, [CUTS[0] - PRE, CUTS[0] + POST], [0, 1], clamp) }}>
        <PrintFinish seed={(Math.floor(frame / 2) % 6) + 1} />
      </AbsoluteFill>
      {SRC.map((v, i) => {
        const lead = Math.min(2, v.from);
        const dur = v.to - v.from + lead + 10;
        return (
          <Sequence key={`vo${i}`} from={CUTS[i] + 12 - lead} durationInFrames={dur} name={`VO ${i + 1}`}>
            <Audio src={staticFile("voiceover/anthropic-files/full.mp3")} trimBefore={v.from - lead} volume={(fr) => interpolate(fr, [0, 2, dur - 6, dur], [0, 1, 1, 0], clamp)} />
          </Sequence>
        );
      })}
      <Sfx />
      <Audio
        src={staticFile("audio/bg-music.mp3")}
        volume={(f) => interpolate(f, [0, 24, TOTAL - 40, TOTAL], [0, 0.12, 0.12, 0], clamp)}
      />
    </AbsoluteFill>
  );
};
