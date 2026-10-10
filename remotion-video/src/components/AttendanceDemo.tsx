import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WifiOff, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { THEME } from '../constants/theme';

export interface AttendanceDemoProps {
  delay?: number;
}

export const AttendanceDemo: React.FC<AttendanceDemoProps> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Students list state simulation
  const students = [
    { name: 'Rohan Mehra', roll: '101', status: 'present', triggerFrame: 15 },
    { name: 'Ananya Sen', roll: '102', status: 'present', triggerFrame: 25 },
    { name: 'Kunal Joshi', roll: '103', status: 'absent', triggerFrame: 35 },
    { name: 'Priya Verma', roll: '104', status: 'present', triggerFrame: 45 },
  ];

  const cardScale = interpolate(entrance, [0, 1], [0.88, 1]);
  const cardOpacity = interpolate(entrance, [0, 0.3], [0, 1]);

  return (
    <div
      style={{
        width: 330,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 18,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {/* Offline Mode Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid #F59E0B',
          borderRadius: 12,
          padding: '8px 12px',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FBBF24' }}>
          <WifiOff size={15} />
          <span style={{ fontSize: 11, fontWeight: 700 }}>OFFLINE MODE ACTIVE</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            color: '#94A3B8',
          }}
        >
          <RefreshCw size={11} />
          <span>Auto-Syncs</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
          Class 10 - Batch Alpha
        </div>
        <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
          Today's Date
        </div>
      </div>

      {/* Attendance Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {students.map((st, i) => {
          const rowTapped = frame - delay > st.triggerFrame;
          const rowSpring = spring({
            frame: frame - delay - st.triggerFrame,
            fps,
            config: { damping: 10, stiffness: 140 },
          });

          return (
            <div
              key={i}
              style={{
                backgroundColor: '#0F172A',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transform: rowTapped ? `scale(${interpolate(rowSpring, [0, 0.5, 1], [1, 1.03, 1])})` : 'scale(1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#CBD5E1',
                  }}
                >
                  {st.roll.slice(-2)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>
                  {st.name}
                </div>
              </div>

              {/* 1-Tap Toggle Action Button */}
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: !rowTapped
                    ? '#1E293B'
                    : st.status === 'present'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  color: !rowTapped
                    ? '#94A3B8'
                    : st.status === 'present'
                    ? '#34D399'
                    : '#F87171',
                  border: !rowTapped
                    ? '1px solid #334155'
                    : st.status === 'present'
                    ? '1px solid #10B981'
                    : '1px solid #EF4444',
                }}
              >
                {!rowTapped ? (
                  <span>TAP</span>
                ) : st.status === 'present' ? (
                  <>
                    <CheckCircle size={13} />
                    <span>PRESENT</span>
                  </>
                ) : (
                  <>
                    <XCircle size={13} />
                    <span>ABSENT</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Footer notice */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 10,
          color: '#94A3B8',
          gap: 6,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
        <span>Works 100% in basement classrooms • Instant offline save</span>
      </div>
    </div>
  );
};
