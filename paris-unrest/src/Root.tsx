import React from "react";
import { AbsoluteFill, Composition, Folder, Freeze, Still } from "remotion";
import { Cover } from "./scenes/Cover";
import { ParisUnrest, SCENES } from "./Video";
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
  { scene: -1, frame: 0 }, { scene: 0, frame: 385 }, { scene: 1, frame: 322 }, { scene: 2, frame: 372 }, { scene: 3, frame: 276 }, { scene: 4, frame: 305 }, { scene: 5, frame: 182 }, { scene: 6, frame: 388 }, { scene: 7, frame: 240 },
];
const MOTION_A: Cell[] = [
  { scene: 0, frame: 50 }, { scene: 0, frame: 120 }, { scene: 0, frame: 230 }, { scene: 0, frame: 300 }, { scene: 0, frame: 345 }, { scene: 1, frame: 70 }, { scene: 1, frame: 100 }, { scene: 1, frame: 170 }, { scene: 1, frame: 240 }, { scene: 1, frame: 290 }, { scene: 2, frame: 110 }, { scene: 2, frame: 190 }, { scene: 2, frame: 240 }, { scene: 2, frame: 310 }, { scene: 2, frame: 330 }, { scene: 3, frame: 70 },
];
const MOTION_B: Cell[] = [
  { scene: 3, frame: 130 }, { scene: 3, frame: 200 }, { scene: 3, frame: 240 }, { scene: 4, frame: 40 }, { scene: 4, frame: 105 }, { scene: 4, frame: 200 }, { scene: 4, frame: 250 }, { scene: 5, frame: 60 }, { scene: 5, frame: 90 }, { scene: 5, frame: 150 }, { scene: 6, frame: 100 }, { scene: 6, frame: 150 }, { scene: 6, frame: 240 }, { scene: 6, frame: 300 }, { scene: 6, frame: 345 }, { scene: 6, frame: 365 },
];

// Transitions: the whole film frozen just before and just after each cut.
const TransitionSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#111" }}>
    {CUTS.flatMap((c) => [c - 4, c + 3]).map((fr, i) => (
      <div key={i} style={{ position: "absolute", left: (i % 4) * 960, top: Math.floor(i / 4) * 540, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "0 0", overflow: "hidden" }}>
        <Freeze frame={fr}>
          <ParisUnrest />
        </Freeze>
        <div style={{ position: "absolute", left: 0, top: 0, background: "#000", color: "#ff0", font: "600 34px monospace", padding: "4px 12px" }}>{`f${fr}`}</div>
      </div>
    ))}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TransitionSheet" component={TransitionSheet} durationInFrames={TOTAL} fps={FPS} width={3840} height={2160} />
    <Composition id="ParisUnrest-Full" component={ParisUnrest} durationInFrames={TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Still id="Cover" component={Cover} width={WIDTH} height={HEIGHT} />
    <Still id="SceneSheet" component={() => <Sheet cells={FINISHED} cols={3} />} width={3840} height={2160} />
    <Still id="MotionSheetA" component={() => <Sheet cells={MOTION_A} cols={4} />} width={3840} height={2160} />
    <Still id="MotionSheetB" component={() => <Sheet cells={MOTION_B} cols={4} />} width={3840} height={2160} />
    <Still id="EndSheet" component={() => <Sheet cells={[30, 70, 95, 120, 140, 152, 165, 185, 240].map((frame) => ({ scene: 7, frame }))} cols={3} />} width={3840} height={2160} />
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
