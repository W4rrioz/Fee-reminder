import React from 'react';
import { Composition } from 'remotion';
import { EnglishOverview } from './EnglishOverview';
import { EnglishPromo } from './EnglishPromo';
import { HinglishLaunch } from './HinglishLaunch';

export const Root: React.FC = () => {
  return (
    <>
      {/* 1. EnglishOverview: Full product overview video (36.0s @ 30fps = 1080 frames) */}
      <Composition
        id="EnglishOverview"
        component={EnglishOverview}
        durationInFrames={1080}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 2. EnglishPromo: High-energy kinetic promo reel (21.0s @ 30fps = 630 frames) */}
      <Composition
        id="EnglishPromo"
        component={EnglishPromo}
        durationInFrames={630}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* 3. HinglishLaunch: Dedicated launch campaign for Indian coaching tutors (35.33s @ 30fps = 1060 frames) */}
      <Composition
        id="HinglishLaunch"
        component={HinglishLaunch}
        durationInFrames={1060}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
