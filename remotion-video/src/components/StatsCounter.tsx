import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../constants/theme';

export interface StatsCounterProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  color?: string;
  subtext?: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  delay = 0,
  color = THEME.colors.primaryLight,
  subtext,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 18,
      mass: 0.8,
      stiffness: 90,
    },
  });

  const displayNum = Math.round(interpolate(progress, [0, 1], [0, value]));
  const scale = interpolate(progress, [0, 1], [0.85, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 28px',
        backgroundColor: THEME.colors.bgCard,
        borderRadius: 20,
        border: `1px solid ${THEME.colors.borderLight}`,
        boxShadow: THEME.shadows.card,
        transform: `scale(${scale})`,
        opacity,
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: THEME.colors.textMuted,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 800,
          color,
          lineHeight: 1.1,
          fontFamily: THEME.typography.fontFamily,
          textShadow: `0 0 25px ${color}55`,
        }}
      >
        {prefix}
        {displayNum.toLocaleString()}
        {suffix}
      </div>
      {subtext && (
        <div
          style={{
            fontSize: 12,
            color: THEME.colors.textMuted,
            marginTop: 6,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};
