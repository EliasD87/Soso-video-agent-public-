import React from "react";
import { useCurrentFrame } from "remotion";
import { CUTS, LINE_END } from "../timeline";
import { INK, MONO } from "../design/tokens";
import { cue } from "../cues";

// [on-screen text, spoken word it starts on, which occurrence]. Numerals on screen.
const CHUNKS: [string, string, number?][][] = [
  [["Anthropic has filed to go public on Nasdaq,", "Anthropic"], ["likely the week of November 16.", "likely"], ["Its second-quarter operating profit", "Its"], ["topped $2 billion,", "topped"], ["but may dip as compute ramps.", "but"]],
  [["Meanwhile, Meta raised $35 billion", "Meanwhile"], ["and plans $60 billion more,", "and"], ["95 in all.", "ninety-five"], ["But Musk warned financing is closing", "But"], ["for AI firms without revenue.", "for"]],
  [["US-Iran talks are deadlocked", "US-Iran"], ["over who moves first:", "over"], ["Iran reopening Hormuz,", "Iran"], ["or the US lifting its blockade.", "or"], ["Houthis hit a Saudi pipeline,", "Houthis"], ["and Brent held at $115.", "and"]],
  [["Bitcoin sits near $80,000,", "Bitcoin"], ["with CME futures just above spot.", "with"], ["But Bitcoin funds lost $140 million", "But"], ["on Friday,", "on"], ["and stablecoin supply slipped.", "and", 1]],
  [["OpenAI's GPT-6.1 Terra", "OpenAI's"], ["is 3× faster at half the API price.", "is"], ["Kimi's new model hit rate limits,", "Kimi's"], ["as excessive sub-agent calls", "as"], ["overloaded its compute.", "overloaded"]],
  [["So the thesis is unchanged:", "So"], ["the debate is now whether AI pays off,", "the", 1], ["not chip scarcity.", "not"], ["The 10-year sits near 5%,", "The", 2], ["as markets price a new hiking cycle.", "as"]],
  [["Volatility fell, so there's no panic.", "Volatility"], ["Watch the Fed's statement,", "Watch"], ["then the real tests of AI payback:", "then"], ["Google and Microsoft on Wednesday,", "Google"], ["Amazon on Thursday.", "Amazon"]],
  [["That's the desk.", "That's"], ["Track the US tech index,", "Track"], ["crude, gold and Bitcoin on SoDEX.", "crude"]],
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
