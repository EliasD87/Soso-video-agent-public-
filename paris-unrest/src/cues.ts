import words from "./voWords.json";

// Cue a beat on a spoken word instead of a hard-coded frame, so a re-rolled take re-times
// the whole film. Frames are relative to the scene's cut (the line itself starts at 12).
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'-]/g, "");

export const cue = (line: number, word: string, nth = 0, offset = 0): number => {
  const list = words[line] as [string, number][];
  let k = 0;
  for (const [w, f] of list) {
    if (norm(w) === norm(word)) {
      if (k === nth) return (f as number) + offset;
      k++;
    }
  }
  throw new Error(`cue: "${word}" #${nth} is not spoken in line ${line + 1}`);
};

// Index of a spoken word in its line (for caption chunks).
export const wordIndex = (line: number, word: string, nth = 0): number => {
  const list = words[line] as [string, number][];
  let k = 0;
  for (let i = 0; i < list.length; i++) {
    if (norm(list[i][0] as string) === norm(word)) {
      if (k === nth) return i;
      k++;
    }
  }
  throw new Error(`wordIndex: "${word}" #${nth} is not spoken in line ${line + 1}`);
};

// Frame where a line's last word ends, roughly (last word start + 12).
export const lineEnd = (line: number): number => {
  const list = words[line] as [string, number][];
  return (list[list.length - 1][1] as number) + 12;
};
