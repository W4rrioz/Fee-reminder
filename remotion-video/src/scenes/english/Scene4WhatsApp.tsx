import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MessageSquare, Check, Sparkles, Send } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { WhatsAppReminder } from '../../components/WhatsAppReminder';
import { THEME } from '../../constants/theme';

export const Scene4WhatsApp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

  const bulletPoints = [
    'Pre-filled student name & exact pending balance',
    'Embedded direct UPI payment link inside message',
    'Zero manual typing — send to all defaulters in minutes',
    '3x faster payment turnaround compared to phone calls',
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 120px',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <BackgroundGradient glowColor="#25D366" secondaryGlow={THEME.colors.primary} />

      {/* Left Feature Description */}
      <div style={{ maxWidth: 620, zIndex: 2 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(37, 211, 102, 0.15)',
            border: '1px solid #25D366',
            borderRadius: 30,
            padding: '8px 20px',
            marginBottom: 20,
            opacity: interpolate(titleSpring, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <MessageSquare size={16} color="#25D366" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#4ADE80', letterSpacing: 0.5 }}>
            1-TAP WHATSAPP INTEGRATION
          </span>
        </div>

        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            marginBottom: 18,
            opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
          }}
        >
          Gentle Reminders. <br />
          <span style={{ color: '#4ADE80' }}>One-Tap Payments.</span>
        </h1>

        <p
          style={{
            fontSize: 21,
            color: '#CBD5E1',
            lineHeight: 1.5,
            marginBottom: 28,
            opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
          }}
        >
          No more awkward reminder phone calls. Send pre-formatted personalized WhatsApp reminders directly with the UPI payment link attached.
        </p>

        {/* Feature Checkpoints */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bulletPoints.map((point, index) => {
            const pointSpring = spring({
              frame: frame - 12 - index * 6,
              fps,
              config: { damping: 12 },
            });

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 16,
                  color: '#E2E8F0',
                  fontWeight: 600,
                  transform: `translateX(${interpolate(pointSpring, [0, 1], [-20, 0])}px)`,
                  opacity: interpolate(pointSpring, [0, 0.3], [0, 1]),
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(37, 211, 102, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #25D366',
                  }}
                >
                  <Check size={13} color="#25D366" />
                </div>
                <span>{point}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right WhatsApp Preview Card */}
      <div style={{ zIndex: 2 }}>
        <WhatsAppReminder
          studentName="Aarav Gupta"
          parentName="Mr. Rajesh Gupta"
          amount={3200}
          month="October 2026"
          instituteName="Apex Science Academy"
          delay={10}
        />
      </div>
    </div>
  );
};
