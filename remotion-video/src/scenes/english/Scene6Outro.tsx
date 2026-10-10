import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { BrandLogo } from '../../components/BrandLogo';
import { THEME } from '../../constants/theme';

export interface Scene6OutroProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  website?: string;
}

export const Scene6Outro: React.FC<Scene6OutroProps> = ({
  headline = 'Empower Your Coaching Today',
  subheadline = 'Start in under 2 minutes. No GST required. Zero gateway commission.',
  ctaText = 'Set Up Free Institute Account',
  website = 'EduManage.in',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });
  const ctaSpring = spring({ frame: frame - 18, fps, config: { damping: 12, stiffness: 120 } });

  const benefits = [
    'No Credit Card or GST Needed',
    'Direct Bank Settlements',
    'Unlimited Student Records',
    'Free WhatsApp Reminder Integration',
  ];

  return (
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
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <BackgroundGradient glowColor={THEME.colors.primary} secondaryGlow={THEME.colors.secondary} />

      <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BrandLogo size="lg" delay={0} />

        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            marginTop: 24,
            marginBottom: 14,
            opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
            transform: `scale(${interpolate(titleSpring, [0, 1], [0.9, 1])})`,
          }}
        >
          {headline}
        </h1>

        <p
          style={{
            fontSize: 22,
            color: '#CBD5E1',
            maxWidth: 700,
            marginBottom: 32,
            opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
          }}
        >
          {subheadline}
        </p>

        {/* Big CTA Button */}
        <div
          style={{
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '18px 42px',
            borderRadius: 36,
            fontSize: 22,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5), 0 0 50px rgba(16, 185, 129, 0.3)',
            transform: `scale(${interpolate(ctaSpring, [0, 1], [0.85, 1])})`,
            opacity: interpolate(ctaSpring, [0, 0.3], [0, 1]),
            marginBottom: 28,
          }}
        >
          <span>{ctaText}</span>
          <ArrowRight size={24} />
        </div>

        {/* Website URL callout */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#F8FAFC',
            letterSpacing: 1,
            marginBottom: 30,
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
          }}
        >
          Visit <span style={{ color: '#38BDF8', textDecoration: 'underline' }}>{website}</span>
        </div>

        {/* Bottom checklist pills */}
        <div style={{ display: 'flex', gap: 20 }}>
          {benefits.map((b, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#94A3B8',
              }}
            >
              <CheckCircle2 size={16} color="#10B981" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
