import React from 'react';
import { Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { BackgroundGradient } from './components/BackgroundGradient';
import { KineticText } from './components/KineticText';
import { BrandLogo } from './components/BrandLogo';
import { Zap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { THEME } from './constants/theme';

export const EnglishPromo: React.FC = () => {
  // Fast paced ~20 seconds = 600 frames @ 30fps
  // Beat 1 (0 - 100): Kinetic hook "STOP LOSING 2.5% ON EVERY FEE"
  // Beat 2 (100 - 230): "DIRECT UPI TO YOUR BANK" with glowing 0% pill
  // Beat 3 (230 - 360): "1-TAP OFFLINE ATTENDANCE & WHATSAPP REMINDERS"
  // Beat 4 (360 - 480): "BUILT FOR ₹8,000 PHONES"
  // Beat 5 (480 - 600): Outro "EduManage.in • Start Free Today"

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ flex: 1, backgroundColor: '#0F172A', position: 'relative' }}>
      <Audio src={staticFile('audio/english_promo.mp3')} volume={1} />
      <Audio src={staticFile('audio/bg_music_tech.mp3')} volume={0.14} />

      {/* Beat 1: Hook */}
      <Sequence from={0} durationInFrames={100}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <BackgroundGradient glowColor="#EF4444" secondaryGlow="#F59E0B" speed={2} />
          <div
            style={{
              padding: '6px 18px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #EF4444',
              borderRadius: 30,
              color: '#F87171',
              fontWeight: 800,
              fontSize: 16,
              marginBottom: 24,
            }}
          >
            ATTENTION TUTORS & COACHING OWNERS
          </div>

          <KineticText
            text="Stop Losing 2.5% On Every Single Fee Payment"
            fontSize={58}
            highlightWords={['Losing', '2.5%']}
            highlightColor="#EF4444"
          />
        </div>
      </Sequence>

      {/* Beat 2: Direct UPI */}
      <Sequence from={100} durationInFrames={130}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <BackgroundGradient glowColor="#10B981" secondaryGlow="#4F46E5" speed={2} />

          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: '#10B981',
              textShadow: '0 0 50px rgba(16, 185, 129, 0.6)',
              marginBottom: 10,
            }}
          >
            0% COMMISSION
          </div>

          <KineticText
            text="Direct UPI Settled Straight Into Your Bank Account"
            fontSize={50}
            highlightWords={['Straight', 'Bank']}
            highlightColor="#34D399"
          />

          <div
            style={{
              marginTop: 30,
              display: 'flex',
              gap: 20,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                padding: '12px 24px',
                borderRadius: 20,
                color: '#FFFFFF',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Zero Middlemen
            </div>
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                padding: '12px 24px',
                borderRadius: 20,
                color: '#FFFFFF',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Zero Waiting Days
            </div>
          </div>
        </div>
      </Sequence>

      {/* Beat 3: Features Power Pack */}
      <Sequence from={230} durationInFrames={130}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <BackgroundGradient glowColor="#25D366" secondaryGlow="#38BDF8" speed={2} />

          <KineticText
            text="1-Tap WhatsApp Reminders & Offline Attendance"
            fontSize={54}
            highlightWords={['1-Tap', 'WhatsApp', 'Offline']}
            highlightColor="#4ADE80"
          />

          <div
            style={{
              marginTop: 40,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 24,
              maxWidth: 700,
            }}
          >
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 20,
                padding: '24px 30px',
                border: '1px solid #10B981',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: '#34D399' }}>1-CLICK</div>
              <div style={{ fontSize: 16, color: '#E2E8F0', marginTop: 4 }}>
                Personalized WhatsApp Link
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 20,
                padding: '24px 30px',
                border: '1px solid #38BDF8',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: '#38BDF8' }}>OFFLINE</div>
              <div style={{ fontSize: 16, color: '#E2E8F0', marginTop: 4 }}>
                Works In Basement Classrooms
              </div>
            </div>
          </div>
        </div>
      </Sequence>

      {/* Beat 4: Budget Phone Optimization */}
      <Sequence from={360} durationInFrames={120}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <BackgroundGradient glowColor="#F59E0B" secondaryGlow="#4F46E5" speed={2} />

          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#FBBF24',
              marginBottom: 16,
              letterSpacing: 1,
            }}
          >
            ULTRA FAST & LIGHTWEIGHT
          </div>

          <KineticText
            text="Engineered To Run Blazing Fast On ₹8,000 Phones"
            fontSize={54}
            highlightWords={['₹8,000', 'Blazing', 'Fast']}
            highlightColor="#F59E0B"
          />

          <div
            style={{
              fontSize: 24,
              color: '#CBD5E1',
              marginTop: 24,
              fontWeight: 600,
            }}
          >
            No heavy loading. No battery drain. Pure instant speed.
          </div>
        </div>
      </Sequence>

      {/* Beat 5: Outro Call to Action */}
      <Sequence from={480} durationInFrames={120}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <BackgroundGradient glowColor="#4F46E5" secondaryGlow="#10B981" speed={2} />

          <BrandLogo size="lg" subtitle="SMART COACHING PLATFORM" />

          <h2
            style={{
              fontSize: 50,
              fontWeight: 900,
              color: '#FFFFFF',
              marginTop: 20,
              marginBottom: 24,
            }}
          >
            Transform Your Coaching Center Today
          </h2>

          <div
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              padding: '16px 40px',
              borderRadius: 30,
              fontSize: 24,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.5)',
              marginBottom: 20,
            }}
          >
            <span>Start Free At EduManage.in</span>
            <ArrowRight size={24} />
          </div>

          <div style={{ fontSize: 16, color: '#94A3B8', fontWeight: 600 }}>
            Setup in 2 Minutes • No GST Needed • 100% Free Trial
          </div>
        </div>
      </Sequence>
    </div>
  );
};
