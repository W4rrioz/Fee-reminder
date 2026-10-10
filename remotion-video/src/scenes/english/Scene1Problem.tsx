import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { XCircle, AlertTriangle, FileSpreadsheet, Percent, Clock } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { THEME } from '../../constants/theme';

export interface Scene1ProblemProps {
  title?: string;
  subtitle?: string;
}

export const Scene1Problem: React.FC<Scene1ProblemProps> = ({
  title = 'Tired of the Fee Collection Headache?',
  subtitle = 'Manual paper registers, delayed fees, and 2.5% payment gateway cuts.',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

  const painPoints = [
    {
      icon: <FileSpreadsheet size={28} color="#EF4444" />,
      title: 'Messy Paper Registers',
      desc: 'Lost entries & endless diary tracking',
      delay: 15,
    },
    {
      icon: <Clock size={28} color="#F59E0B" />,
      title: 'Constant Fee Delays',
      desc: 'Calling every parent repeatedly',
      delay: 25,
    },
    {
      icon: <Percent size={28} color="#EF4444" />,
      title: '2.5% Gateway Cuts',
      desc: 'Losing ₹2,500 on every ₹1 Lakh collected',
      delay: 35,
    },
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
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      <BackgroundGradient glowColor="#EF4444" secondaryGlow="#F59E0B" />

      {/* Warning Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #EF4444',
          borderRadius: 30,
          padding: '8px 20px',
          marginBottom: 20,
          opacity: interpolate(titleSpring, [0, 0.5], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
        }}
      >
        <AlertTriangle size={18} color="#EF4444" />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#FCA5A5' }}>
          COACHING INSTITUTE STRUGGLE
        </span>
      </div>

      {/* Main Title */}
      <h1
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: '#FFFFFF',
          textAlign: 'center',
          maxWidth: 900,
          margin: 0,
          lineHeight: 1.15,
          opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
          transform: `scale(${interpolate(titleSpring, [0, 1], [0.9, 1])})`,
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: 22,
          color: '#94A3B8',
          textAlign: 'center',
          maxWidth: 800,
          marginTop: 14,
          marginBottom: 45,
          opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
        }}
      >
        {subtitle}
      </p>

      {/* 3 Pain Cards */}
      <div style={{ display: 'flex', gap: 24, zIndex: 2 }}>
        {painPoints.map((item, index) => {
          const itemSpring = spring({
            frame: frame - item.delay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <div
              key={index}
              style={{
                width: 270,
                backgroundColor: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: 20,
                padding: '24px 20px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                opacity: interpolate(itemSpring, [0, 0.3], [0, 1]),
                transform: `translateY(${interpolate(itemSpring, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC', marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
