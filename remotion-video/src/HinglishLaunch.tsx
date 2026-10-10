import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';
import { Scene1Problem } from './scenes/english/Scene1Problem';
import { Scene2Intro } from './scenes/english/Scene2Intro';
import { Scene3UpiDirect } from './scenes/english/Scene3UpiDirect';
import { Scene4WhatsApp } from './scenes/english/Scene4WhatsApp';
import { Scene5Dashboard } from './scenes/english/Scene5Dashboard';
import { Scene6Outro } from './scenes/english/Scene6Outro';

export const HinglishLaunch: React.FC = () => {
  // Synchronized to hinglish_launch.mp3 (35.26s @ 30fps = 1060 frames)
  return (
    <div style={{ flex: 1, backgroundColor: '#0F172A', position: 'relative' }}>
      {/* Audio Track: Voiceover + Background Music */}
      <Audio src={staticFile('audio/hinglish_launch.mp3')} volume={1} />
      <Audio src={staticFile('audio/bg_music_tech.mp3')} volume={0.12} />

      {/* Scene 1: Fee collection ki chinta ab khatam! (0 - 188) */}
      <Sequence from={0} durationInFrames={188}>
        <Scene1Problem
          title="Fee Collection Ki Chinta Ab Khatam!"
          subtitle="Kacche register, baar-baar phone calls, aur payment gateway ke 2.5% charges se azaadi."
        />
      </Sequence>

      {/* Scene 2: EduManage: India ka smart coaching management app (188 - 371) */}
      <Sequence from={188} durationInFrames={183}>
        <Scene2Intro />
      </Sequence>

      {/* Scene 3: Direct UPI fees seedhe aapke account mein (371 - 544) */}
      <Sequence from={371} durationInFrames={173}>
        <Scene3UpiDirect />
      </Sequence>

      {/* Scene 4: WhatsApp par ek click me fee reminder (544 - 710) */}
      <Sequence from={544} durationInFrames={166}>
        <Scene4WhatsApp />
      </Sequence>

      {/* Scene 5: Basement ho ya 2G network, attendance lagao offline! (710 - 890) */}
      <Sequence from={710} durationInFrames={180}>
        <Scene5Dashboard />
      </Sequence>

      {/* Scene 6: Aaj hi start karein bilkul free! (890 - 1060) */}
      <Sequence from={890} durationInFrames={170}>
        <Scene6Outro
          headline="Coaching Ko Banao Smart Aur Tension-Free"
          subheadline="Sirf 2 minute me shuru karein. Koi GST nahi chahiye. 0% gateway charges."
          ctaText="Free Institute Account Banayein"
          website="EduManage.in"
        />
      </Sequence>
    </div>
  );
};
