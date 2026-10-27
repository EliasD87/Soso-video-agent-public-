import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Scrawl, Tape } from "../design/Hand";
import { EASE, lerp, pop, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords } from "../design/Type";
import { INK, MONO, SERIF, SPOT } from "../design/tokens";
import { cue } from "../cues";

// 08 · SoDEX end card — the desk signs off on paper, then the real SoDEX futures screen (live
// captures, 2x) rises onto the desk. The camera pushes into the market header and chart; each
// market's own page comes up as it is named. Pull back for the QR at "on SoDEX".
// "That's the desk. Track the US tech index, crude, gold and Bitcoin on SoDEX."
const c = (w: string, nth = 0, off = 0) => cue(7, w, nth, off);

// sodex.com/trade/futures/<symbol>, captured 2026-10-27 at 1920×1080 @2x.
const SHOTS = ["ustech", "cl", "xaut", "btc"]; // USTECH100-USD, CL-USD, XAUT-USD, BTC-USD

const KEYS: CamKey[] = [
  { f: -12, x: 940, y: 500, s: 1.08 },
  { f: c("track", 0, -14), x: 960, y: 530, s: 1.02 },
  { f: c("SoDEX", 0, 110), x: 965, y: 540, s: 1.04 },
];

export const S8EndCard: React.FC = () => {
  const f = useF();
  const tIn = c("track", 0, -12);
  const p = pop(f, tIn, 16, 80, 1);
  const lits = [c("tech", 0, -10), c("crude", 0, -4), c("gold", 0, -4), c("Bitcoin", 0, -4)];

  // Three framings: landed on the desk -> pushed into the market header and chart -> pulled back.
  const zin = prog(f, lits[0] - 12, lits[0] + 6, EASE);
  const zout = prog(f, c("on", 0, -16), c("SoDEX", 0, 2), EASE);
  const drift = prog(f, lits[0], lits[3] + 20, EASE);
  const land = { tx: 190, ty: 112, s: 0.7, rx: lerp(34, 10, p), ry: lerp(-26, -13, p), rz: lerp(7, 1.6, p) };
  const zoom = { tx: 660 - drift * 70, ty: 392 - drift * 30, s: 1.62 + drift * 0.05, rx: 2, ry: -3, rz: 0.3 };
  const end = { tx: 170, ty: 118, s: 0.74, rx: 7, ry: -8, rz: 1 };
  const mix = (k: keyof typeof land) => lerp(lerp(land[k], zoom[k], zin), end[k], zout);

  const tagAt = c("on", 0, -6);
  const tag = slap(f, tagAt, 4, 1.3);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS} drift={5}>
        <div style={{ position: "absolute", left: -200, top: -200, width: 2320, height: 1500 }}>
          <Paper />
        </div>
        <div style={{ position: "absolute", left: 100, top: 128, fontFamily: SERIF, fontWeight: 900, fontSize: 128, lineHeight: 1, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
          <CueWords words={[["That's", c("That's")], ["the", c("the")], ["desk.", c("desk")]]} wordStyle={(i) => (i === 2 ? { color: SPOT } : undefined)} />
        </div>
      </Camera>

      {/* The real SoDEX screen rises onto the desk */}
      {f >= tIn ? (
        <div style={{ position: "absolute", inset: 0, perspective: 2600, perspectiveOrigin: "60% 40%" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1920,
              height: 1080,
              transformOrigin: "50% 50%",
              transform: `translate(${mix("tx")}px, ${mix("ty") + (1 - p) * 950}px) rotateX(${mix("rx")}deg) rotateY(${mix("ry")}deg) rotateZ(${mix("rz")}deg) scale(${mix("s")})`,
              boxShadow: "0 70px 110px rgba(20,12,4,0.5), 0 0 0 9px #111113, 0 0 0 11px #2a2a2e",
              borderRadius: 4,
              background: "#000",
              overflow: "hidden",
            }}
          >
            {SHOTS.map((s, i) => (
              <Img
                key={s}
                src={staticFile(`scenes/sodex/${s}.png`)}
                style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: i === 0 ? 1 : prog(f, lits[i], lits[i] + 3) }}
              />
            ))}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 32%, rgba(255,255,255,0) 46%)", pointerEvents: "none" }} />
          </div>
        </div>
      ) : null}

      {/* QR tag taped over the screen corner */}
      {tag.visible ? (
        <div style={{ position: "absolute", left: 1530, top: 560, width: 300, padding: "22px 22px 18px", background: "#f8f4ea", transform: tag.transform, opacity: tag.opacity, filter: tag.filter, textAlign: "center" }}>
          <Img src={staticFile("brand/qr-sodex.png")} style={{ width: 236, display: "block", margin: "0 auto" }} />
          <Img src={staticFile("brand/sodex-logo-dark.svg")} style={{ width: 200, marginTop: 16 }} />
          <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 18, letterSpacing: "0.16em", color: INK, marginTop: 6 }}>SODEX.COM</div>
        </div>
      ) : null}
      <Tape x={1610} y={540} rot={6} w={140} h={42} opacity={prog(f, tagAt + 4, tagAt + 6)} />
      <Scrawl text="on SoDEX" at={c("SoDEX", 0, -6)} dur={14} size={92} rot={-6} style={{ left: 1290, top: 112 }} />
    </AbsoluteFill>
  );
};
