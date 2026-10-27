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
  // transitions (TRANS = brush, ink, whip, grid, tear, drop, whipL, brush)
  { s: "brush", at: tr(0), v: 0.176 },
  { s: "whoosh-soft", at: tr(1), v: 0.158 },
  { s: "whoosh", at: tr(2), v: 0.176 },
  { s: "whoosh-soft", at: tr(3), v: 0.15 },
  { s: "tear", at: tr(4), v: 0.158 },
  { s: "drop", at: tr(5) + 4, v: 0.141 },
  { s: "whoosh", at: tr(6), v: 0.176 },
  { s: "brush", at: tr(7), v: 0.158 },
  // S1 · ANT stamps under Nasdaq; the calendar is clipped on
  { s: "stamp", at: w(0, "Nasdaq", 0, 14), v: 0.13 },
  { s: "drop", at: w(0, "likely", 0, -6), v: 0.14 },
  // S2 · the planned cheque slides out; the application lands
  { s: "whoosh-soft", at: w(1, "plans", 0, -2), v: 0.13 },
  { s: "drop", at: w(1, "But", 0, 0), v: 0.15 },
  // S3 · Iran's boom drops back; the pipeline clipping lands; the gauge needle swings
  { s: "drop", at: w(2, "reopening", 0, 22), v: 0.12 },
  { s: "drop", at: w(2, "Houthis", 0, -4), v: 0.15 },
  { s: "tick", at: w(2, "Brent", 0, -2), v: 0.12 },
  // S4 · the coin lands; the ledger lands
  { s: "coin", at: w(3, "Bitcoin", 0, -4), v: 0.16 },
  { s: "drop", at: w(3, "But", 0, -2), v: 0.14 },
  // S5 · the tray lands; the call slips rain in
  { s: "drop", at: w(4, "Kimi's", 0, 0), v: 0.15 },
  { s: "whoosh-soft", at: w(4, "excessive", 0, 0), v: 0.14 },
  // S6 · the agenda card lands
  { s: "drop", at: w(5, "debate", 0, -4), v: 0.14 },
  // S7 · the folders land
  { s: "drop", at: w(6, "Fed's", 0, -4), v: 0.14 },
  { s: "drop", at: w(6, "Google", 0, -4), v: 0.13 },
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
