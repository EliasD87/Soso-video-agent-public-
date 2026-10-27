import React from "react";
import { EASE, lerp, useF } from "./motion";

// One camera over a world larger than the frame. Each key says which world point sits at
// frame centre, at what scale and roll; between keys the camera eases. A slow handheld
// drift keeps it alive while it holds.
export type CamKey = { f: number; x: number; y: number; s?: number; r?: number };

export const camAt = (keys: CamKey[], f: number) => {
  const k = [...keys].sort((a, b) => a.f - b.f);
  if (f <= k[0].f) return { ...k[0], s: k[0].s ?? 1, r: k[0].r ?? 0, v: 0 };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (f <= b.f) {
      const t = EASE((f - a.f) / (b.f - a.f));
      const t2 = EASE(Math.min(1, (f + 1 - a.f) / (b.f - a.f)));
      const x = lerp(a.x, b.x, t);
      const y = lerp(a.y, b.y, t);
      const v = Math.hypot(lerp(a.x, b.x, t2) - x, lerp(a.y, b.y, t2) - y);
      return { f, x, y, s: lerp(a.s ?? 1, b.s ?? 1, t), r: lerp(a.r ?? 0, b.r ?? 0, t), v };
    }
  }
  const z = k[k.length - 1];
  return { ...z, s: z.s ?? 1, r: z.r ?? 0, v: 0 };
};

export const Camera: React.FC<{
  keys: CamKey[];
  drift?: number;
  blur?: boolean;
  vw?: number;
  vh?: number;
  children: React.ReactNode;
}> = ({ keys, drift = 2, blur = true, vw = 1920, vh = 1080, children }) => {
  const f = useF();
  const c = camAt(keys, f);
  const dx = Math.sin(f / 47) * drift + Math.sin(f / 19) * drift * 0.25;
  const dy = Math.cos(f / 53) * drift * 0.7;
  const mb = blur ? Math.min(7, c.v * 0.09) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 8000,
          height: 6000,
          transformOrigin: "0 0",
          transform: `translate(${vw / 2 + dx}px, ${vh / 2 + dy}px) rotate(${c.r}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`,
          filter: mb > 0.4 ? `blur(${mb}px)` : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};
