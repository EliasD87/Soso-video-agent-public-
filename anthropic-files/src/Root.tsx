import React from "react";
import { AbsoluteFill, Composition, Folder, Freeze, Still, useCurrentFrame } from "remotion";
import { Cover } from "./scenes/Cover";
import { AnthropicFiles, SCENES } from "./Video";
import { CUTS, TOTAL } from "./timeline";
import { InkDefs } from "./design/Paper";
import { SceneClock } from "./design/motion";

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;

const DUR = SCENES.map((_, i) => (i < SCENES.length - 1 ? CUTS[i + 1] - CUTS[i] : TOTAL - CUTS[i]));

// Review sheets: scenes frozen at chosen frames, tiled.
type Cell = { scene: number; frame: number }; // scene -1 = cover
const Sheet: React.FC<{ cells: Cell[]; cols: number }> = ({ cells, cols }) => {
  const w = 3840 / cols;
  const s = w / 1920;
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      <InkDefs />
      {cells.map((c, i) => {
        const Scene = c.scene < 0 ? Cover : SCENES[c.scene];
        return (
          <div key={i} style={{ position: "absolute", left: (i % cols) * w, top: Math.floor(i / cols) * 1080 * s, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "0 0", overflow: "hidden" }}>
            <SceneClock offset={-c.frame}>
              <Scene />
            </SceneClock>
            <div style={{ position: "absolute", left: 0, top: 0, background: "#000", color: "#ff0", font: "600 34px monospace", padding: "4px 12px" }}>
              {c.scene < 0 ? "COVER" : `S${c.scene + 1} @${c.frame}`}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const FINISHED: Cell[] = [
  { scene: -1, frame: 0 }, { scene: 0, frame: 330 }, { scene: 1, frame: 290 }, { scene: 2, frame: 325 }, { scene: 3, frame: 295 }, { scene: 4, frame: 345 }, { scene: 5, frame: 268 }, { scene: 6, frame: 292 }, { scene: 7, frame: 215 },
];
const MOTION_A: Cell[] = [
  { scene: 0, frame: 50 }, { scene: 0, frame: 140 }, { scene: 0, frame: 240 }, { scene: 0, frame: 300 }, { scene: 1, frame: 90 }, { scene: 1, frame: 160 }, { scene: 1, frame: 240 }, { scene: 2, frame: 70 }, { scene: 2, frame: 135 }, { scene: 2, frame: 185 }, { scene: 2, frame: 250 }, { scene: 2, frame: 290 }, { scene: 3, frame: 60 }, { scene: 3, frame: 125 }, { scene: 3, frame: 200 }, { scene: 3, frame: 260 },
];
const MOTION_B: Cell[] = [
  { scene: 4, frame: 60 }, { scene: 4, frame: 130 }, { scene: 4, frame: 210 }, { scene: 4, frame: 265 }, { scene: 4, frame: 300 }, { scene: 5, frame: 50 }, { scene: 5, frame: 95 }, { scene: 5, frame: 125 }, { scene: 5, frame: 220 }, { scene: 6, frame: 30 }, { scene: 6, frame: 80 }, { scene: 6, frame: 140 }, { scene: 6, frame: 200 }, { scene: 6, frame: 250 }, { scene: 7, frame: 60 }, { scene: 7, frame: 120 },
];

// Transitions: the whole film frozen just before and just after each cut.
const TransitionSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    {CUTS.flatMap((c) => [c - 4, c + 3]).map((fr, i) => (
      <div key={i} style={{ position: "absolute", left: (i % 4) * 960, top: Math.floor(i / 4) * 540, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "0 0", overflow: "hidden" }}>
        <Freeze frame={fr}>
          <AnthropicFiles />
        </Freeze>
        <div style={{ position: "absolute", left: 0, top: 0, background: "#000", color: "#ff0", font: "600 34px monospace", padding: "4px 12px" }}>{`f${fr}`}</div>
      </div>
    ))}
  </AbsoluteFill>
);

const END: Cell[] = [20, 50, 75, 95, 110, 125, 145, 175, 220].map((frame) => ({ scene: 7, frame }));

// Every scene sheet as one frame each, so a single render pass loads the fonts once. (TransitionSheet
// freezes the whole film, so it needs its own full-length composition.)
const AllSheets: React.FC = () => {
  const fr = useCurrentFrame();
  if (fr === 0) return <Sheet cells={FINISHED} cols={3} />;
  if (fr === 1) return <Sheet cells={MOTION_A} cols={4} />;
  if (fr === 2) return <Sheet cells={MOTION_B} cols={4} />;
  return <Sheet cells={END} cols={3} />;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TransitionSheet" component={TransitionSheet} durationInFrames={TOTAL} fps={FPS} width={3840} height={2160} />
    <Composition id="AllSheets" component={AllSheets} durationInFrames={4} fps={FPS} width={3840} height={2160} />
    <Composition id="AnthropicFiles-Full" component={AnthropicFiles} durationInFrames={TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="Cover" component={Cover} width={WIDTH} height={HEIGHT} />
    <Still id="SceneSheet" component={() => <Sheet cells={FINISHED} cols={3} />} width={3840} height={2160} />
    <Still id="MotionSheetA" component={() => <Sheet cells={MOTION_A} cols={4} />} width={3840} height={2160} />
    <Still id="MotionSheetB" component={() => <Sheet cells={MOTION_B} cols={4} />} width={3840} height={2160} />
    <Still id="EndSheet" component={() => <Sheet cells={[20, 50, 75, 95, 110, 125, 145, 175, 220].map((frame) => ({ scene: 7, frame }))} cols={3} />} width={3840} height={2160} />
    <Folder name="Scenes">
      {SCENES.map((Scene, i) => (
        <Composition
          key={i}
          id={`S${i + 1}`}
          component={() => (
            <AbsoluteFill>
              <InkDefs />
              <Scene />
            </AbsoluteFill>
          )}
          durationInFrames={DUR[i]}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      ))}
    </Folder>
  </>
);
