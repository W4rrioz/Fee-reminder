import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { Scene1Problem } from './scenes/english/Scene1Problem';
import { Scene2Intro } from './scenes/english/Scene2Intro';
import { Scene3UpiDirect } from './scenes/english/Scene3UpiDirect';
import { Scene4WhatsApp } from './scenes/english/Scene4WhatsApp';
import { Scene5Dashboard } from './scenes/english/Scene5Dashboard';
import { Scene6Outro } from './scenes/english/Scene6Outro';

export const EnglishOverview: React.FC = () => {
  // Synchronized to english_overview.mp3 (35.76s @ 30fps = 1080 frames)
  return (
    <div style={{ flex: 1, backgroundColor: '#0F172A', position: 'relative' }}>
      {/* Audio Tracks: Voiceover + Background Music */}
      <Audio src={staticFile('audio/english_overview.mp3')} volume={1} />
      <Audio src={staticFile('audio/bg_music_tech.mp3')} volume={0.12} />

      {/* Scene 1: Problem Hook (0 - 145) */}
      <Sequence from={0} durationInFrames={145}>
        <Scene1Problem />
      </Sequence>

      {/* Scene 2: Introducing EduManage (145 - 345) */}
      <Sequence from={145} durationInFrames={200}>
        <Scene2Intro />
      </Sequence>

      {/* Scene 3: Feature Highlight - 0% Direct UPI (345 - 510) */}
      <Sequence from={345} durationInFrames={165}>
        <Scene3UpiDirect />
      </Sequence>

      {/* Scene 4: Feature Highlight - 1-Tap WhatsApp (510 - 665) */}
      <Sequence from={510} durationInFrames={155}>
        <Scene4WhatsApp />
      </Sequence>

      {/* Scene 5: Feature Highlight - Dashboard & Offline Attendance (665 - 850) */}
      <Sequence from={665} durationInFrames={185}>
        <Scene5Dashboard />
      </Sequence>

      {/* Scene 6: Outro CTA (850 - 1080) */}
      <Sequence from={850} durationInFrames={230}>
        <Scene6Outro />
      </Sequence>
    </div>
  );
};
