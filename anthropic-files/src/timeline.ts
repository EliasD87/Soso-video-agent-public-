import timing from "./voTiming.json";

// One voice take, played back line by line so pauses can be set: gaps capped at 1.0s, and the turn
// into the Trade Setup act (line 6) gets a longer breath.
const L = timing.lines;
const GAP = (i: number) => (i === 5 ? 1.6 : Math.min(1.0, L[i].start - L[i - 1].end));
export const STARTS: number[] = [];
L.forEach((l, i) => {
  if (i === 0) STARTS.push(0);
  else STARTS.push(STARTS[i - 1] + (L[i - 1].end - L[i - 1].start) + GAP(i));
});

export const NARR = 42; // narration starts here; the cover holds before it
export const CUTS = STARTS.map((s) => NARR - 12 + Math.round(s * 30)); // each scene's cut, 12f before its line
export const LINE_END = L.map((l, i) => NARR + Math.round((STARTS[i] + l.end - l.start) * 30));
export const TOTAL = LINE_END[L.length - 1] + 66;
export const PRE = 10; // incoming scene shows this many frames before its cut
export const POST = 10; // outgoing scene stays this many frames after the next cut

// Where line i sits inside full.mp3 (frames), for segment playback.
export const SRC = L.map((l) => ({ from: Math.round(l.start * 30), to: Math.round(l.end * 30) }));
