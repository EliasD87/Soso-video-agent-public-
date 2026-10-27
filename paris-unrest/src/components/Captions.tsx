import React from "react";
import { useCurrentFrame } from "remotion";
import { CUTS, LINE_END } from "../timeline";
import { INK, MONO } from "../design/tokens";
import { cue } from "../cues";

// [on-screen text, spoken word it starts on, which occurrence]. Numerals on screen.
const CHUNKS: [string, string, number?][][] = [
  [["Anti-government protests swept France.", "Anti-government"], ["Paris stocks fell 1.5%,", "Paris"], ["and French 10-year yields jumped to nearly 5%.", "and", 1], ["Contagion fears turned to Italy,", "Contagion"], ["lifting US yields.", "lifting"]],
  [["Houthi and Saudi forces clashed", "Houthi"], ["six times in two days.", "six"], ["Brent climbed to near $110.", "Brent"], ["Putin proposed a Ukraine summit,", "Putin"], ["and the US paused Russia sanctions.", "and", 2]],
  [["China's economy beat forecasts,", "China's"], ["growing 4.5%.", "growing"], ["But investment fell almost 10%,", "But"], ["and property sank more than a quarter.", "and", 1], ["The central bank re-anchored", "The"], ["to a cheaper overnight rate.", "to", 0]],
  [["Anthropic plans to file for its IPO next week,", "Anthropic"], ["with a listing by mid-November.", "with"], ["OpenAI is reportedly racing", "OpenAI"], ["to raise sovereign money before then.", "to", 1]],
  [["Bitcoin briefly touched $83K", "Bitcoin"], ["and sits near $82K.", "and"], ["Ether is near $2,400,", "Ether"], ["and ether funds saw bigger outflows", "and", 1], ["than Bitcoin funds.", "than"]],
  [["The thesis is unchanged.", "The"], ["Yields are high but contained,", "Yields"], ["and tech earnings are the catalyst.", "and"]],
  [["Watch the 10-year around 5.15%,", "Watch"], ["with jobless claims and Friday's PMI ahead.", "with"], ["In chips, the question shifts", "In"], ["from supply to returns,", "from"], ["as Tesla, Meta and Nvidia", "as"], ["take the stage Wednesday.", "take"]],
  [["That's the desk.", "That's"], ["With AI earnings ahead,", "With"], ["track the US tech index,", "track"], ["crude, gold and Bitcoin on SoDEX.", "crude"]],
];

const SPANS = CHUNKS.flatMap((line, i) =>
  line.map(([text, w, nth], j) => {
    const start = CUTS[i] + cue(i, w, nth ?? 0) - 2;
    const next = line[j + 1];
    const end = next ? CUTS[i] + cue(i, next[1], next[2] ?? 0) - 2 : LINE_END[i] + 8;
    return { text, start, end };
  }),
);

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = SPANS.find((s) => frame >= s.start && frame < s.end);
  if (!c) return null;
  const t = Math.min(1, (frame - c.start) / 4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: "rgba(248,244,234,0.96)",
          padding: "9px 22px 8px",
          fontFamily: MONO,
          fontWeight: 600,
          fontSize: 31,
          color: INK,
          letterSpacing: "0.01em",
          boxShadow: "0 6px 12px rgba(30,18,6,0.22)",
          opacity: t,
          transform: `translateY(${(1 - t) * 6}px)`,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};
