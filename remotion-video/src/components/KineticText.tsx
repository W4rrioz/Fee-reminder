import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../constants/theme';

export interface KineticTextProps {
  text: string;
  delay?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  highlightWords?: string[];
  highlightColor?: string;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  color = THEME.colors.textWhite,
  fontSize = 48,
  fontWeight = 800,
  letterSpacing = -0.5,
  highlightWords = [],
  highlightColor = THEME.colors.secondaryLight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3em',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {words.map((word, index) => {
        const wordDelay = delay + index * 3;
        const progress = spring({
          frame: frame - wordDelay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        const translateY = interpolate(progress, [0, 1], [35, 0]);
        const opacity = interpolate(progress, [0, 0.4], [0, 1]);
        const scale = interpolate(progress, [0, 1], [0.85, 1]);

        const cleanWord = word.replace(/[^a-zA-Z0-9%₹]/g, '');
        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === cleanWord.toLowerCase()
        );

        return (
          <span
            key={index}
            style={{
              display: 'inline-block',
              fontSize,
              fontWeight,
              letterSpacing,
              color: isHighlighted ? highlightColor : color,
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              textShadow: isHighlighted ? `0 0 25px ${highlightColor}66` : 'none',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
