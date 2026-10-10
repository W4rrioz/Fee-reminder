import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { THEME } from '../constants/theme';

export interface BackgroundGradientProps {
  glowColor?: string;
  secondaryGlow?: string;
  speed?: number;
}

export const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  glowColor = THEME.colors.primary,
  secondaryGlow = THEME.colors.secondary,
  speed = 1,
}) => {
  const frame = useCurrentFrame();

  // Gentle ambient floating movement
  const x1 = interpolate(
    Math.sin((frame * 0.02 * speed)),
    [-1, 1],
    [15, 35]
  );
  const y1 = interpolate(
    Math.cos((frame * 0.025 * speed)),
    [-1, 1],
    [20, 45]
  );

  const x2 = interpolate(
    Math.cos((frame * 0.018 * speed)),
    [-1, 1],
    [65, 85]
  );
  const y2 = interpolate(
    Math.sin((frame * 0.022 * speed)),
    [-1, 1],
    [55, 80]
  );

  const gridOpacity = interpolate(
    Math.sin(frame * 0.03),
    [-1, 1],
    [0.08, 0.15]
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: THEME.colors.bgDark,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Dynamic ambient orb 1 */}
      <div
        style={{
          position: 'absolute',
          left: `${x1}%`,
          top: `${y1}%`,
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor}55 0%, transparent 70%)`,
          filter: 'blur(70px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dynamic ambient orb 2 */}
      <div
        style={{
          position: 'absolute',
          left: `${x2}%`,
          top: `${y2}%`,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${secondaryGlow}44 0%, transparent 70%)`,
          filter: 'blur(80px)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Modern subtle tech grid overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: gridOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Vignette border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent 40%, rgba(10, 15, 29, 0.8) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
