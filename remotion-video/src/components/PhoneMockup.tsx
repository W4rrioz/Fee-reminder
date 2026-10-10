import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../constants/theme';

export interface PhoneMockupProps {
  children: React.ReactNode;
  tiltAngle?: number;
  scale?: number;
  headerTitle?: string;
  delay?: number;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  tiltAngle = -6,
  scale = 1,
  headerTitle = 'EduManage',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 100,
    },
  });

  const floatY = interpolate(
    Math.sin((frame - delay) * 0.05),
    [-1, 1],
    [-6, 6]
  );

  const rotateY = interpolate(entrance, [0, 1], [25, tiltAngle]);
  const rotateX = interpolate(entrance, [0, 1], [-15, 4]);
  const translateY = interpolate(entrance, [0, 1], [150, 0]) + floatY;
  const opacity = interpolate(entrance, [0, 0.4], [0, 1]);

  return (
    <div
      style={{
        perspective: 1200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          width: 360,
          height: 640,
          backgroundColor: '#0F172A',
          borderRadius: 44,
          border: '7px solid #334155',
          boxShadow: `
            0 25px 60px -15px rgba(0, 0, 0, 0.9),
            0 0 35px rgba(79, 70, 229, 0.35),
            inset 0 0 4px rgba(255, 255, 255, 0.2)
          `,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone Speaker & Camera Notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 18,
            backgroundColor: '#1E293B',
            borderRadius: 12,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              backgroundColor: '#475569',
              borderRadius: 2,
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              backgroundColor: '#38BDF8',
              borderRadius: '50%',
              opacity: 0.8,
            }}
          />
        </div>

        {/* Screen Top Status Bar */}
        <div
          style={{
            padding: '12px 20px 6px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11,
            color: THEME.colors.textMuted,
            fontWeight: 600,
            marginTop: 14,
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <span>9:41 AM</span>
          <span style={{ color: THEME.colors.secondaryLight, fontSize: 10 }}>
            {headerTitle}
          </span>
          <span>4G 100%</span>
        </div>

        {/* Phone Content Screen */}
        <div
          style={{
            flex: 1,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#090D16',
          }}
        >
          {children}
        </div>

        {/* Phone Bottom Home Indicator */}
        <div
          style={{
            height: 16,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 4,
          }}
        >
          <div
            style={{
              width: 90,
              height: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
};
