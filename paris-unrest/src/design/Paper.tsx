import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PAPER } from "./tokens";

// Newsprint ground: scanned sheet, soft top-left light, warm vignette.
export const Paper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ backgroundColor: PAPER, overflow: "hidden" }}>
    <Img
      src={staticFile("common/paper.jpg")}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        filter: "sepia(0.22) saturate(1.25) brightness(1.03)",
      }}
    />
    {children}
  </AbsoluteFill>
);

// Wrap type in this to print it: ragged ink edges and pinhole specks, like letterpress on newsprint.
export const InkDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="2" result="speck" />
        <feColorMatrix
          in="speck"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -10 8.1"
          result="specks"
        />
        <feComposite in="rough" in2="specks" operator="in" />
      </filter>
      <filter id="marker-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="4" />
        <feDisplacementMap in="SourceGraphic" scale="3" />
      </filter>
      <filter id="stamp-ink" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="21" result="edge" />
        <feDisplacementMap in="SourceGraphic" in2="edge" scale="4" result="rough" />
        <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="8" result="patch" />
        <feColorMatrix in="patch" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -5 3.4" result="patches" />
        <feComposite in="rough" in2="patches" operator="in" />
      </filter>
    </defs>
  </svg>
);

// Sits above everything: light falloff + vignette + fine grain, so every layer reads as one printed sheet.
export const PrintFinish: React.FC<{ seed?: number }> = ({ seed = 3 }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 85% 75% at 38% 40%, rgba(255,250,240,0) 55%, rgba(70,48,24,0.20) 100%)",
        mixBlendMode: "multiply",
      }}
    />
    <AbsoluteFill
      style={{
        background: "linear-gradient(160deg, rgba(255,252,244,0.10) 0%, rgba(0,0,0,0) 45%, rgba(60,40,20,0.08) 100%)",
      }}
    />
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.32, mixBlendMode: "multiply" }}>
      <filter id={`grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.33  0 0 0 -1.6 1.15" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
    </svg>
  </AbsoluteFill>
);
