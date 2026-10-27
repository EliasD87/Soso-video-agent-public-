import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame } from "remotion";

export const FPS = 30;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Easing set: EASE for camera moves (slow out, quick middle, soft land), OUT for arrivals.
export const EASE = Easing.bezier(0.65, 0, 0.25, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const IN = Easing.bezier(0.55, 0, 0.8, 0.2);

// Scene clock: every scene reads frames relative to its own cut, even while it is
// already on screen during the incoming transition (negative frames).
const Clock = React.createContext(0);
export const SceneClock: React.FC<{ offset: number; children: React.ReactNode }> = ({ offset, children }) =>
  React.createElement(Clock.Provider, { value: offset }, children);
export const useF = () => useCurrentFrame() - React.useContext(Clock);

export const prog = (f: number, a: number, b: number, ease = EASE) =>
  interpolate(f, [a, b], [0, 1], { ...clamp, easing: ease });

// Spring with overshoot: things LAND.
export const pop = (f: number, at: number, damping = 11, stiffness = 170, mass = 0.8) =>
  f < at ? 0 : spring({ frame: f - at, fps: FPS, config: { damping, stiffness, mass } });

// Stop-motion boil: a cut-out jitters in held steps, like it was animated on twos/threes.
export const boil = (f: number, seed: string, amp = 1, hold = 3) => {
  const k = Math.floor(f / hold);
  return {
    x: (random(`${seed}x${k}`) - 0.5) * 2 * amp,
    y: (random(`${seed}y${k}`) - 0.5) * 2 * amp,
    r: (random(`${seed}r${k}`) - 0.5) * amp * 0.5,
  };
};

// An object slapped onto the page: drops from above the paper, overshoots, shadow tightens.
export const slap = (f: number, at: number, rot = 0, from = 1.3) => {
  const p = pop(f, at, 12, 260, 0.7);
  const s = from + (1 - from) * p;
  const lift = Math.max(0, 1 - p);
  return {
    visible: f >= at,
    opacity: f < at ? 0 : Math.min(1, (f - at + 1) / 3),
    transform: `scale(${s}) rotate(${rot + lift * 7}deg)`,
    filter: `drop-shadow(0 ${8 + lift * 34}px ${10 + lift * 30}px rgba(40,24,8,${0.26 - lift * 0.08}))`,
  };
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
