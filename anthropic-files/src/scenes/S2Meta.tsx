import React from "react";
import { AbsoluteFill } from "remotion";
import { Camera, CamKey } from "../design/Camera";
import { Handwrite, InkPath, Tape } from "../design/Hand";
import { OUT, prog, slap, useF } from "../design/motion";
import { Paper } from "../design/Paper";
import { CueWords, TypeOn } from "../design/Type";
import { Abs } from "../design/ui";
import { CREAM, INK, MONO, SERIF, SPOT, TABLOID } from "../design/tokens";
import { cue } from "../cues";

// 02 · Meta's raise — a cheque made out to Meta Platforms is filled in by hand: $35 billion, the memo
// splitting it into common and convertible. A second, dashed cheque marked PLANNED slides out from under
// it for $60 billion more; a bracket gathers both and "$95B in all" is written. The camera crosses the
// desk to Musk's warning: an application for financing whose REVENUE box is written "none", and the
// CLOSING box ticked as the voice says "closing".
// "Meanwhile, Meta raised thirty-five billion dollars and plans sixty billion more, ninety-five in all.
//  But Musk warned financing is closing for AI firms without revenue."
const c = (w: string, nth = 0, off = 0) => cue(1, w, nth, off);

const mono: React.CSSProperties = { fontFamily: MONO, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: INK };
const GUILLOCHE =
  "repeating-linear-gradient(35deg, rgba(46,125,79,0.07) 0 2px, transparent 2px 9px), repeating-linear-gradient(-35deg, rgba(46,125,79,0.07) 0 2px, transparent 2px 9px)";

const CHEQUE = { x: 110, y: 290, w: 1020, h: 360 };

const Cheque: React.FC = () => {
  const f = useF();
  const s = slap(f, c("Meta", 0, -6), -1.2, 1.15);
  if (!s.visible) return null;
  return (
    <div style={{ position: "absolute", left: CHEQUE.x, top: CHEQUE.y, width: CHEQUE.w, height: CHEQUE.h, background: "#e6eee0", backgroundImage: GUILLOCHE, transform: s.transform, opacity: s.opacity, filter: s.filter, boxShadow: "inset 0 0 0 3px rgba(46,125,79,0.35)" }}>
      <div style={{ position: "absolute", left: 36, top: 26, ...mono }}>INVESTORS · PAY TO THE ORDER OF</div>
      <div style={{ position: "absolute", left: 36, top: 62, fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: "-0.02em", color: INK }}>
        <TypeOn text="Meta Platforms" at={c("Meta", 0, -2)} cps={34} caret={false} style={{ fontFamily: SERIF }} />
      </div>
      <div style={{ position: "absolute", left: 36, right: 36, top: 140, height: 2, background: "rgba(25,23,20,0.35)" }} />
      <div style={{ position: "absolute", right: 36, top: 160, width: 470, height: 104, border: "2px solid rgba(25,23,20,0.4)", background: "rgba(255,255,255,0.45)" }} />
      <div style={{ position: "absolute", left: 36, top: 186, ...mono }}>AMOUNT</div>
      <Handwrite text="$35 billion" at={c("thirty-five", 0, -2)} dur={14} size={78} halo={null} rot={-3} style={{ right: 70, top: 170 }} />
      <div style={{ position: "absolute", left: 36, right: 36, top: 286, height: 2, background: "rgba(25,23,20,0.35)" }} />
      <div style={{ position: "absolute", left: 36, top: 302, ...mono, fontSize: 20, opacity: prog(f, c("dollars", 0, 0), c("dollars", 0, 6)) }}>
        MEMO · $22.5B COMMON + $12.5B CONVERTIBLE
      </div>
      <Tape x={440} y={-20} rot={2} w={140} h={40} />
    </div>
  );
};

// The planned raise: a dashed cheque that slides out from under the first.
const Planned: React.FC = () => {
  const f = useF();
  const p = prog(f, c("plans", 0, -6), c("plans", 0, 10), OUT);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: CHEQUE.x + 50, top: CHEQUE.y + 30 + p * 330, width: CHEQUE.w, height: 300, background: "rgba(246,241,228,0.94)", border: `4px dashed rgba(25,23,20,0.55)`, transform: `rotate(${1.4 * p}deg)`, boxShadow: "0 12px 18px rgba(40,24,8,0.2)" }}>
      <div style={{ position: "absolute", left: 32, top: 22, ...mono }}>PLANNED RAISE</div>
      <div style={{ position: "absolute", left: 32, top: 60, fontFamily: TABLOID, fontSize: 84, lineHeight: 1, letterSpacing: "0.03em", color: INK, opacity: 0.85 }}>MORE</div>
      <div style={{ position: "absolute", right: 32, top: 110, width: 470, height: 104, border: "2px dashed rgba(25,23,20,0.45)" }} />
      <Handwrite text="$60 billion" at={c("sixty", 0, -2)} dur={14} size={78} halo={null} rot={-3} style={{ right: 66, top: 118 }} />
    </div>
  );
};

const FORM = { x: 2000, y: 440, w: 980, h: 500 };

const Form: React.FC = () => {
  const f = useF();
  const s = slap(f, c("But", 0, -2), 1, 1.15);
  if (!s.visible) return null;
  const tick = prog(f, c("closing", 0, -2), c("closing", 0, 8), OUT);
  return (
    <div style={{ position: "absolute", left: FORM.x, top: FORM.y, width: FORM.w, height: FORM.h, background: "#fbf8ef", transform: s.transform, opacity: s.opacity, filter: s.filter }}>
      <div style={{ height: 66, background: INK, color: CREAM, fontFamily: MONO, fontWeight: 600, fontSize: 26, letterSpacing: "0.18em", lineHeight: "68px", paddingLeft: 30 }}>APPLICATION FOR FINANCING</div>
      {[150, 290, 420].map((y) => (
        <div key={y} style={{ position: "absolute", left: 30, right: 30, top: y + 76, height: 2, background: "rgba(25,23,20,0.25)" }} />
      ))}
      <div style={{ position: "absolute", left: 30, top: 106, ...mono }}>APPLICANT</div>
      <div style={{ position: "absolute", left: 280, top: 90, fontFamily: SERIF, fontWeight: 900, fontSize: 56, letterSpacing: "-0.02em", color: INK }}>
        <TypeOn text="AI firm" at={c("AI", 0, -2)} cps={26} caret={false} style={{ fontFamily: SERIF }} />
      </div>
      <div style={{ position: "absolute", left: 30, top: 246, ...mono }}>REVENUE</div>
      <div style={{ position: "absolute", left: 280, top: 214, width: 460, height: 100, border: "2px solid rgba(25,23,20,0.4)", background: "rgba(255,255,255,0.4)" }} />
      <Handwrite text="none" at={c("without", 0, -2)} dur={12} size={84} halo={null} rot={-4} style={{ left: 320, top: 220 }} />
      <div style={{ position: "absolute", left: 30, top: 378, ...mono }}>FINANCING</div>
      {[
        { label: "OPEN", x: 280 },
        { label: "CLOSING", x: 520 },
      ].map((b) => (
        <React.Fragment key={b.label}>
          <div style={{ position: "absolute", left: b.x, top: 366, width: 48, height: 48, border: `3px solid ${INK}` }} />
          <div style={{ position: "absolute", left: b.x + 64, top: 374, ...mono, fontSize: 26 }}>{b.label}</div>
        </React.Fragment>
      ))}
      <InkPath d="M0,6 C14,18 30,34 44,46" w={44} h={46} stroke={8} progress={Math.min(1, tick * 2)} style={{ left: 500, top: 344 }} />
      <InkPath d="M44,2 C30,16 16,32 2,48" w={44} h={48} stroke={8} progress={Math.max(0, tick * 2 - 1)} style={{ left: 500, top: 342 }} />
    </div>
  );
};

const KEYS: CamKey[] = [
  { f: -12, x: 960, y: 560, s: 1.04 },
  { f: c("Meta"), x: 960, y: 560, s: 1.02 },
  { f: c("all", 0, 4), x: 980, y: 580, s: 1.0 },
  { f: c("Musk", 0, 0), x: 2480, y: 560, s: 1.0 },
  { f: c("revenue", 0, 40), x: 2490, y: 565, s: 1.02 },
];

export const S2Meta: React.FC = () => {
  const f = useF();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Camera keys={KEYS}>
        <div style={{ position: "absolute", left: -400, top: -300, width: 4000, height: 1700 }}>
          <Paper />
        </div>

        {/* ── the raise ── */}
        <Abs x={110} y={108} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="META · FUNDING" at={c("Meanwhile", 0, -4)} cps={40} />
        </Abs>
        <div style={{ position: "absolute", left: 100, top: 148, fontFamily: SERIF, fontWeight: 900, fontSize: 112, lineHeight: 1, letterSpacing: "-0.04em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
          <CueWords words={[["Meta", c("Meta")], ["raised", c("raised")]]} wordStyle={(i) => (i === 1 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
        </div>
        <Planned />
        <Cheque />
        <InkPath d="M0,0 C26,10 30,40 28,330 C26,620 30,650 0,660" w={30} h={660} stroke={9} progress={prog(f, c("ninety-five", 0, -6), c("ninety-five", 0, 8), OUT)} style={{ left: 1196, top: 300 }} />
        <Handwrite text="$95B" at={c("ninety-five", 0, -2)} dur={12} size={150} rot={-6} underline style={{ left: 1270, top: 470 }} />
        <Handwrite text="in all" at={c("in", 0, -2)} dur={10} size={84} color={INK} rot={-4} style={{ left: 1300, top: 690 }} />

        {/* ── the warning ── */}
        <Abs x={1960} y={108} style={{ fontSize: 28, fontWeight: 600, letterSpacing: "0.16em", color: INK, fontFamily: MONO }}>
          <TypeOn text="MUSK WARNED" at={c("Musk", 0, -4)} cps={40} />
        </Abs>
        <div style={{ position: "absolute", left: 1950, top: 148, fontFamily: SERIF, fontWeight: 900, fontSize: 92, lineHeight: 1.04, letterSpacing: "-0.035em", color: INK, filter: "url(#ink)", whiteSpace: "nowrap" }}>
          <CueWords words={[["Financing", c("financing")], ["is", c("is")], ["closing", c("closing")]]} wordStyle={(i) => (i === 2 ? { color: SPOT, fontStyle: "italic" } : undefined)} />
          <div>
            <CueWords words={[["for", c("for")], ["AI", c("AI")], ["firms", c("firms")], ["without", c("without")], ["revenue.", c("revenue")]]} />
          </div>
        </div>
        <Form />
      </Camera>
    </AbsoluteFill>
  );
};
