import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { THEME } from '../constants/theme';

export interface BrandLogoProps {
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  delay = 0,
  size = 'md',
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const iconScale = interpolate(entrance, [0, 1], [0.7, 1]);
  const opacity = interpolate(entrance, [0, 0.3], [0, 1]);

  const sizes = {
    sm: { icon: 28, text: 24, padding: 8, gap: 10 },
    md: { icon: 42, text: 36, padding: 12, gap: 14 },
    lg: { icon: 64, text: 54, padding: 18, gap: 18 },
  }[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: sizes.gap,
        }}
      >
        <div
          style={{
            padding: sizes.padding,
            backgroundColor: THEME.colors.primary,
            borderRadius: sizes.padding * 1.5,
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.5)',
            transform: `scale(${iconScale})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GraduationCap size={sizes.icon} color="#FFFFFF" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: sizes.text,
              fontWeight: 900,
              letterSpacing: -0.8,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Edu</span>
            <span style={{ color: THEME.colors.secondaryLight }}>Manage</span>
            <Sparkles size={sizes.icon * 0.4} color={THEME.colors.accent} />
          </div>
        </div>
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: sizes.text * 0.38,
            color: THEME.colors.textMuted,
            fontWeight: 600,
            marginTop: 6,
            letterSpacing: 0.5,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
