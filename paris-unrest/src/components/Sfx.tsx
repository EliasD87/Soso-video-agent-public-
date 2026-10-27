import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { CUTS, PRE } from "../timeline";
import { cue } from "../cues";

// Sound effects: sparse, quiet, and placed so each sound's loudest point lands on its moment.
// Files in public/sfx are trimmed and levelled to the same loudness (scripts/sfxprep.py), so the
// volumes below are the whole mix: transitions ~0.16 (they fall in pauses, a little over the music
// bed), foley ~0.15-0.26 (1-11 dB under the voice). Voice is 1.0, music 0.12.
const PEAK_MS: Record<string, number> = {
  brush: 294, tear: 658, stamp: 43, snip: 116, coin: 221, till: 1094, tick: 177, drop: 96, whoosh: 54, "whoosh-soft": 286, rise: 339, bell: 84, match: 595,
};
const LEN_F: Record<string, number> = {
  brush: 30, tear: 24, stamp: 8, snip: 24, coin: 44, till: 60, tick: 28, drop: 14, whoosh: 14, "whoosh-soft": 14, rise: 36, bell: 37, match: 60,
};

type Hit = { s: keyof typeof PEAK_MS; at: number; v: number };

// absolute frame of a spoken word in scene i (scenes run on CUTS[i] + their own clock)
const w = (i: number, word: string, nth = 0, off = 0) => CUTS[i] + cue(i, word, nth, off);
// the middle of the transition into scene i
const tr = (i: number) => CUTS[i] - PRE + 10;

const HITS: Hit[] = [
  // transitions (TRANS = brush, whipL, drop, tear, whip, ink, grid, brush)
  { s: "brush", at: tr(0), v: 0.176 },
  { s: "whoosh", at: tr(1), v: 0.176 },
  { s: "drop", at: tr(2) + 4, v: 0.141 },
  { s: "tear", at: tr(3), v: 0.158 },
  { s: "whoosh", at: tr(4), v: 0.176 },
  { s: "whoosh-soft", at: tr(5), v: 0.158 },
  { s: "drop", at: tr(6) + 4, v: 0.141 },
  { s: "brush", at: tr(7), v: 0.158 },
  // S1 · the yield placard is thrust up; the US ten-year tag lands
  { s: "whoosh-soft", at: w(0, "jumped", 0, 0), v: 0.15 },
  { s: "stamp", at: w(0, "US", 0, -4), v: 0.166 },
  // S2 · the tape measure locks at the top; the last place card lands
  { s: "tick", at: w(1, "ten", 0, 6), v: 0.154 },
  { s: "drop", at: w(1, "summit", 0, -2), v: 0.15 },
  // S3 · the gold star is slapped on; the anchor hits the overnight berth
  { s: "stamp", at: w(2, "forecasts", 0, 6), v: 0.15 },
  { s: "drop", at: w(2, "overnight", 0, 0), v: 0.2 },
  // S4 · the stopwatch starts
  { s: "tick", at: w(3, "racing", 0, -4), v: 0.154 },
  // S5 · the puck rings the bell
  { s: "bell", at: w(4, "touched", 0, 0), v: 0.17 },
  // S6 · the match is struck and flares
  { s: "match", at: w(5, "catalyst", 0, -2), v: 0.17 },
  // S7 · correction fluid is brushed on; the playbill goes up
  { s: "brush", at: w(6, "supply", 0, 14), v: 0.13 },
  { s: "drop", at: w(6, "as", 0, -6), v: 0.15 },
  // S8 · the SoDEX screen rises; the QR tag lands
  { s: "rise", at: w(7, "track", 0, -4), v: 0.179 },
  { s: "drop", at: w(7, "on", 0, -2), v: 0.179 },
];

export const Sfx: React.FC = () => (
  <>
    {HITS.map((h, i) => {
      const from = Math.max(0, Math.round(h.at - (PEAK_MS[h.s] / 1000) * 30));
      return (
        <Sequence key={i} from={from} durationInFrames={LEN_F[h.s] + 4} name={`SFX ${h.s}`}>
          <Audio src={staticFile(`sfx/${h.s}.wav`)} volume={h.v} />
        </Sequence>
      );
    })}
  </>
);
