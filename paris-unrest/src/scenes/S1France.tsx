import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, MarkerLoop, Scrawl, Tape } from "../design/Hand";
import { boil, OUT, pop, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT } from "../design/tokens";
import eu from "../data/europeMap.json";
import { cue } from "../cues";

// 01 · France — the crowd surges up from the bottom of the page, and its placards carry the market:
// one is hand-lettered CAC 40 −1.5%, the other the French ten-year, thrust up on "jumped". The camera
// slides to a printed map of Europe: red ink floods France, then bleeds across the Alps into Italy
// ("contagion"), and a marker arrow carries it over the Atlantic to the US ten-year tag.
// "Anti-government protests swept France. Paris stocks fell one and a half percent, and French ten-year
//  yields jumped to nearly five percent. Contagion fears turned to Italy, lifting US yields."
const c = (w: string, nth = 0, off = 0) => cue(0, w, nth, off);

// The map card, and the crop of the projected map shown inside it.
const CARD = { x: 2350, y: 50, w: 1400, h: 1000 };
const VB = { x: 120, y: 180, w: 1360, h: 970 };
const OX = 20; // where the crop sits inside the card
const OY = 15;
const LON0 = -11;
const LAT1 = 58.5;
const KX = Math.cos((46 * Math.PI) / 180);
const S = eu.w / ((27 - LON0) * KX);
// lon/lat → card coordinates
const MP = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX * S - VB.x + OX, (LAT1 - lat) * S - VB.y + OY];
// lon/lat → map (svg user) coordinates
const MU = (lon: number, lat: number): [number, number] => [(lon - LON0) * KX * S, (LAT1 - lat) * S];
const PARIS = MP(2.35, 48.86);

const LABELS: [string, number, number, number?][] = [
  ["FRANCE", 2.4, 46.6, 30],
  ["ITALY", 12.9, 42.6, 28],
  ["GERMANY", 10.4, 51.3, 24],
  ["SPAIN", -3.6, 40.3, 24],
  ["U.K.", -1.6, 52.6, 22],
];

const MapSheet: React.FC = () => {
  const f = useF();
  const fr = prog(f, c("Contagion", 0, -10), c("fears", 0, 4), OUT) * 760;
  const it = prog(f, c("turned", 0, -4), c("Italy", 0, 14), OUT) * 720;
  const [px, py] = MU(2.35, 48.86);
  const [bx, by] = MU(7.0, 44.6); // the Alps: where the ink crosses
  const id = React.useId().replace(/:/g, "");
  return (
    <svg width={VB.w} height={VB.h} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} style={{ position: "absolute", left: OX, top: OY, overflow: "hidden" }}>
      <defs>
        <pattern id="euDots" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="3.5" cy="3.5" r="1.5" fill={INK} />
        </pattern>
        <pattern id="euSea" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0,12 Q4,9 8,12 T16,12" fill="none" stroke="rgba(25,23,20,0.13)" strokeWidth="1" />
        </pattern>
        <filter id={`bleed${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="120" />
        </filter>
        <mask id={`mFR${id}`} maskUnits="userSpaceOnUse" x={-500} y={-500} width={3000} height={3000}>
          <circle cx={px} cy={py} r={fr} fill="#fff" filter={`url(#bleed${id})`} />
        </mask>
        <mask id={`mIT${id}`} maskUnits="userSpaceOnUse" x={-500} y={-500} width={3000} height={3000}>
          <circle cx={bx} cy={by} r={it} fill="#fff" filter={`url(#bleed${id})`} />
        </mask>
      </defs>
      <rect x={-200} y={-200} width={2200} height={2000} fill="url(#euSea)" />
      {eu.others.map((d, i) => (
        <path key={i} d={d} fill="url(#euDots)" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" opacity={0.55} />
      ))}
      {Object.entries(eu.countries).map(([k, d]) => (
        <path key={k} d={d} fill="url(#euDots)" stroke={INK} strokeWidth={k === "FRA" || k === "ITA" ? 2.4 : 1.3} strokeLinejoin="round" opacity={k === "FRA" || k === "ITA" ? 0.95 : 0.6} />
      ))}
      <path d={eu.countries.FRA} fill={SPOT} mask={`url(#mFR${id})`} opacity={0.92} style={{ mixBlendMode: "multiply" }} />
      <path d={eu.countries.ITA} fill={SPOT} mask={`url(#mIT${id})`} opacity={0.92} style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
};

// A protest placard: cardboard on a stick, thrust up out of the crowd; hand-lettered.
const Placard: React.FC<{ x: number; y: number; w: number; h: number; rise: number; jump?: number; rot: number; seed: string; children: React.ReactNode }> = ({ x, y, w, h, rise, jump, rot, seed, children }) => {
  const f = useF();
  if (f < rise - 1) return null;
  const up = pop(f, rise, 12, 120, 0.9);
  const j = jump !== undefined ? pop(f, jump, 9, 200, 0.7) : 0;
  const bob = Math.sin(f / 8 + seed.length) * 6 * up;
  const sway = Math.sin(f / 11 + seed.length * 2) * 1.6;
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - up) * 760 - j * 190 + bob, width: w, transformOrigin: "50% 100%", transform: `rotate(${rot + sway}deg)` }}>
      <div style={{ position: "absolute", left: w / 2 - 12, top: h - 10, width: 24, height: 760, background: "linear-gradient(90deg, #7d5d3a, #9c7a50 45%, #6e5132)", boxShadow: "0 6px 10px rgba(30,18,6,0.3)" }} />
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          background: "linear-gradient(168deg, #d4b483 0%, #c7a36f 55%, #b99461 100%)",
          clipPath: "polygon(0% 2%, 22% 0%, 61% 1.5%, 100% 0%, 99% 38%, 100% 74%, 98.5% 100%, 55% 98.5%, 14% 100%, 0.5% 99%, 1.5% 60%, 0% 31%)",
          boxShadow: "inset 0 0 40px rgba(90,60,25,0.25)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, rgba(120,85,40,0.08) 0 3px, transparent 3px 9px)" }} />
        {children}
      </div>
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 540, s: 1.06 },
  { f: c("France", 0, 8), x: 960, y: 540, s: 1.0 },
  { f: c("Paris", 0, -8), x: 1010, y: 530, s: 1.03 },
  { f: c("percent", 1, 8), x: 1010, y: 530, s: 1.03 },
  { f: c("Contagion", 0, 6), x: 2960, y: 545, s: 1.0 },
  { f: c("yields", 1, 30), x: 2950, y: 545, s: 1.03 },
];

export const S1France: React.FC = () => {
  const f = useF();
  const crowdUp = prog(f, c("protests", 0, -10), c("swept", 0, 6), OUT);
  const cb = boil(f, "crowd", 1.4);
  const tag = slap(f, c("US", 0, -4), -4, 1.35);
  const [lx, ly] = MP(12.9, 42.6);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -300, top: -300, width: 4600, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the street ── */}
        <Abs x={100} y={112} style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.14em", color: INK }}>
          <TypeOn text="FRANCE · ANTI-GOVERNMENT PROTESTS" at={c("Anti-government")} cps={44} />
        </Abs>
        <Abs x={92} y={164} w={1150} style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 136, lineHeight: 0.98, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)" }}>
          <CueWords words={[["Protests", c("protests")], ["swept", c("swept")], ["France.", c("France")]]} gap="0.2em" wordStyle={(i) => (i === 2 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </Abs>

        {/* placards come up out of the crowd (drawn behind it) */}
        <Placard x={1010} y={258} w={430} h={290} rise={c("Paris", 0, -6)} rot={-6} seed="cac">
          <Scrawl text="CAC 40" at={c("Paris", 0, 2)} dur={12} size={74} color={INK} rot={-2} style={{ left: 40, top: 30 }} />
          <Scrawl text="−1.5%" at={c("one", 0, -2)} dur={14} size={118} color={SPOT} rot={-3} style={{ left: 34, top: 124 }} />
        </Placard>
        <Placard x={1480} y={350} w={400} h={330} rise={c("French", 0, -6)} jump={c("jumped", 0, -2)} rot={5} seed="oat10">
          <Scrawl text="FRENCH 10Y" at={c("French", 0, 2)} dur={14} size={56} color={INK} rot={-3} style={{ left: 30, top: 28 }} />
          <Scrawl text="4.91%" at={c("nearly", 0, -2)} dur={14} size={118} color={SPOT} rot={-3} style={{ left: 26, top: 104 }} />
          <Scrawl text="+13bp" at={c("percent", 1, 0)} dur={10} size={52} color={INK} rot={-4} style={{ left: 200, top: 246 }} />
        </Placard>

        <Img
          src={staticFile("scenes/crowd.png")}
          style={{ position: "absolute", left: -80 + cb.x, top: 606 + (1 - crowdUp) * 520 + cb.y, width: 2160, filter: "drop-shadow(0 -6px 14px rgba(40,24,8,0.18))" }}
        />

        {/* ── the map ── */}
        <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, background: "#f3eddd", transform: "rotate(0.6deg)", boxShadow: "0 14px 22px rgba(40,24,8,0.22), 0 2px 3px rgba(40,24,8,0.18)", overflow: "hidden" }}>
          <MapSheet />
          {LABELS.map(([t, lo, la, size]) => {
            const [x, y] = MP(lo, la);
            return (
              <div key={t} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", fontFamily: MONO, fontWeight: 600, fontSize: size ?? 24, letterSpacing: "0.2em", color: INK, background: "rgba(243,237,221,0.85)", padding: "2px 8px" }}>
                {t}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: PARIS[0] - 9, top: PARIS[1] - 9, width: 18, height: 18, borderRadius: 9, background: INK, border: `3px solid ${CREAM}` }} />
          <div style={{ position: "absolute", left: 30, top: 24, fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.18em", color: INK, background: "rgba(243,237,221,0.9)", padding: "4px 10px" }}>
            EUROPE · CONTAGION WATCH
          </div>
          <MarkerLoop w={330} h={470} seed="italy" stroke={8} progress={prog(f, c("Italy", 0, -4), c("lifting", 0, 2), OUT)} style={{ left: lx - 170, top: ly - 250 }} />
        </div>
        <Tape x={CARD.x + 620} y={CARD.y - 22} rot={-3} w={170} h={46} />
        <Handwrite text="CONTAGION?" at={c("Contagion", 0, -2)} dur={16} rot={-6} size={86} style={{ left: CARD.x + 860, top: CARD.y + 300 }} />

        {/* … lifting US yields: the arrow crosses the Atlantic to the US ten-year */}
        <InkPath
          d="M640,250 C560,150 440,120 330,160"
          w={640}
          h={260}
          stroke={8}
          head
          progress={prog(f, c("lifting", 0, -2), c("US", 0, 6), OUT)}
          style={{ left: CARD.x + PARIS[0] - 640, top: CARD.y + PARIS[1] - 250 }}
        />
        {tag.visible ? (
          <div style={{ position: "absolute", left: 2110, top: 300, padding: "18px 28px 14px", background: CREAM, transform: tag.transform, opacity: tag.opacity, filter: tag.filter, borderLeft: `10px solid ${SPOT}` }}>
            <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: INK }}>US 10-YEAR</div>
            <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 104, lineHeight: 1, letterSpacing: "-0.04em", color: SPOT, marginTop: 6 }}>
              <span style={{ color: INK }}>~</span>5.15%
            </div>
          </div>
        ) : null}
        <Scrawl text="lifting" at={c("lifting", 0, -2)} dur={12} size={64} rot={-5} style={{ left: 2230, top: 560 }} />
      </Camera>
    </AbsoluteFill>
  );
};
