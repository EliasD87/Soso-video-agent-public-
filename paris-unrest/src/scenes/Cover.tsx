import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SERIF, UI } from "../design/tokens";

// Cover = the thumbnail (covers/ project, cover v2): one clean cinematic photo, the big serif headline
// with the key words on the vermilion brush, the logo, and the desk line. The film opens on it.
const INK = "#141210";
const CREAM = "#faf6ee";
const SPOT = "#ff3d1c";

// brush.png is 2770x951; its solid paint spans cols 160-2605 and rows 251-720. The image is sized
// from the words' own box so that solid band always covers them.
const BAND_W = (2605 - 160) / 2770;
const BAND_H = (720 - 251) / 951;
const BAND_X = 160 / 2770;
const BAND_Y = 251 / 951;

const Brushed: React.FC<{ children: React.ReactNode; size: number }> = ({ children, size }) => (
  <div style={{ position: "relative", display: "inline-block", transform: "rotate(-2deg)", transformOrigin: "0% 50%" }}>
    <Img
      src={staticFile("cover/brush.png")}
      style={{
        position: "absolute",
        width: `${100 / BAND_W}%`,
        height: `${100 / BAND_H}%`,
        left: `${(-BAND_X / BAND_W) * 100}%`,
        top: `${(-BAND_Y / BAND_H) * 100}%`,
        objectFit: "fill",
      }}
    />
    <div
      style={{
        position: "relative",
        padding: `${size * 0.1}px ${size * 0.22}px ${size * 0.24}px ${size * 0.16}px`,
        fontFamily: SERIF,
        fontStyle: "italic",
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.03em",
        color: CREAM,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </div>
  </div>
);

const SIZE1 = 180;
const SIZE2 = 150;
const SHIFT = 150; // the photo is pushed right so the arch clears the headline

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM} 70%, #e9e1d2 100%)`, overflow: "hidden" }}>
    <Img
      src={staticFile("cover/paris-unrest.jpg")}
      style={{
        position: "absolute",
        left: SHIFT,
        top: 0,
        width: 1920,
        height: 1080,
        objectFit: "cover",
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 16%, #000 34%)",
        maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.55) 16%, #000 34%)",
      }}
    />
    {/* soft light behind the type, so the left reads as clean haze */}
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 75% at 18% 45%, rgba(250,246,238,0.85), rgba(250,246,238,0) 70%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(20,14,8,0.18) 100%)" }} />

    <Img src={staticFile("brand/sosovalue-logo-dark.svg")} style={{ position: "absolute", left: 100, top: 84, height: 58 }} />

    <div style={{ position: "absolute", left: 92, top: 222 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: SIZE1, lineHeight: 1, letterSpacing: "-0.035em", color: INK, whiteSpace: "nowrap" }}>Paris unrest</div>
      <div style={{ marginTop: SIZE1 * 0.02, marginLeft: -10 }}>
        <Brushed size={SIZE2}>lifts yields</Brushed>
      </div>
    </div>

    <div style={{ position: "absolute", left: 100, top: 912, display: "flex", alignItems: "center", gap: 34, fontFamily: UI, fontWeight: 500, fontSize: 30, letterSpacing: "0.42em", color: INK }}>
      <div style={{ width: 74, height: 4, background: SPOT }} />
      MACRO TRADING DESK
    </div>
  </AbsoluteFill>
);
