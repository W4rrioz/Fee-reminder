import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BarChart3, WifiOff, Users, CheckCircle2 } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { AttendanceDemo } from '../../components/AttendanceDemo';
import { StatsCounter } from '../../components/StatsCounter';
import { THEME } from '../../constants/theme';

export const Scene5Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

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
      <BackgroundGradient glowColor={THEME.colors.primary} secondaryGlow={THEME.colors.accent} />

      {/* Left Column: Owner Dashboard "3 Key Numbers" */}
      <div style={{ maxWidth: 600, zIndex: 2 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            border: '1px solid #4F46E5',
            borderRadius: 30,
            padding: '8px 20px',
            marginBottom: 20,
            opacity: interpolate(titleSpring, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <BarChart3 size={16} color="#818CF8" />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#A5B4FC', letterSpacing: 0.5 }}>
            THE 3 KEY NUMBERS DASHBOARD
          </span>
        </div>

        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            marginBottom: 16,
            opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
          }}
        >
          Total Clarity in <br />
          <span style={{ color: THEME.colors.accentLight }}>Just 5 Seconds Every Morning</span>
        </h1>

        <p
          style={{
            fontSize: 20,
            color: '#CBD5E1',
            lineHeight: 1.45,
            marginBottom: 28,
            opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
          }}
        >
          Instantly know your Collected vs Due fees, Today's attendance rate, and defaulter list. Plus, record attendance without internet in underground classrooms!
        </p>

        {/* The 3 Key Stats Numbers */}
        <div style={{ display: 'flex', gap: 16 }}>
          <StatsCounter
            label="Collected"
            value={185000}
            prefix="₹"
            color="#10B981"
            subtext="Due: ₹35,000"
            delay={10}
          />
          <StatsCounter
            label="Attendance"
            value={94}
            suffix="%"
            color="#38BDF8"
            subtext="188 / 200 Present"
            delay={18}
          />
          <StatsCounter
            label="Defaulters"
            value={12}
            color="#F59E0B"
            subtext="1-Tap Reminder Ready"
            delay={26}
          />
        </div>
      </div>

      {/* Right Column: Attendance Demo */}
      <div style={{ zIndex: 2 }}>
        <AttendanceDemo delay={10} />
      </div>
    </div>
  );
};
