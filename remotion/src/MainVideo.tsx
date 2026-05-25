import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

import { PersistentBackground } from "./components/PersistentBackground";
import { PersistentAccents } from "./components/PersistentAccents";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneTyping } from "./scenes/SceneTyping";
import { SceneThinking } from "./scenes/SceneThinking";
import { SceneAnswer } from "./scenes/SceneAnswer";
import { SceneOutro } from "./scenes/SceneOutro";

loadSpaceGrotesk("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadInter("normal", { weights: ["300", "400", "500", "600"], subsets: ["latin"] });

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const D_INTRO = 75;
const D_TYPING = 165;
const D_THINK = 105;
const D_ANSWER = 210;
const D_OUTRO = 75;
const T = 20;

export const TOTAL_FRAMES =
  D_INTRO + D_TYPING + D_THINK + D_ANSWER + D_OUTRO - 4 * T;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#06070D" }}>
      <PersistentBackground />
      <PersistentAccents />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_INTRO}>
          <SceneIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={D_TYPING}>
          <SceneTyping />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={D_THINK}>
          <SceneThinking />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={D_ANSWER}>
          <SceneAnswer />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />
        <TransitionSeries.Sequence durationInFrames={D_OUTRO}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Sequence from={0}>
        <Audio src={staticFile("audio/bg.mp3")} volume={0.55} />
      </Sequence>
    </AbsoluteFill>
  );
};