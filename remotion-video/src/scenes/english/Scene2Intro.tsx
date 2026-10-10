import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sparkles, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { PhoneMockup } from '../../components/PhoneMockup';
import { BrandLogo } from '../../components/BrandLogo';
import { THEME } from '../../constants/theme';

export const Scene2Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 14 } });

  const badges = [
    { icon: <Zap size={16} color="#F59E0B" />, label: 'Fast & Lightweight' },
    { icon: <Smartphone size={16} color="#10B981" />, label: 'Built for ₹8k Phones' },
    { icon: <ShieldCheck size={16} color="#818CF8" />, label: '100% Secure & Direct' },
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
      <BackgroundGradient glowColor={THEME.colors.primary} secondaryGlow={THEME.colors.secondary} />

      {/* Left text column */}
      <div style={{ maxWidth: 650, zIndex: 2 }}>
        <BrandLogo delay={0} size="md" subtitle="SMART COACHING OPERATING SYSTEM" />

        <h1
          style={{
            fontSize: 56,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            marginTop: 24,
            marginBottom: 16,
            opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          Say Hello to <span style={{ color: THEME.colors.secondaryLight }}>EduManage</span>
        </h1>

        <p
          style={{
            fontSize: 22,
            color: '#CBD5E1',
            lineHeight: 1.45,
            marginBottom: 32,
            opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
          }}
        >
          The simplest fee collection & coaching management platform designed for India's tutors and institute owners.
        </p>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {badges.map((b, i) => {
            const bSpring = spring({ frame: frame - 15 - i * 8, fps, config: { damping: 12 } });
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 24,
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#F8FAFC',
                  transform: `scale(${interpolate(bSpring, [0, 1], [0.85, 1])})`,
                  opacity: interpolate(bSpring, [0, 0.3], [0, 1]),
                }}
              >
                {b.icon}
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Phone Mockup with EduManage App preview inside */}
      <div style={{ zIndex: 2 }}>
        <PhoneMockup tiltAngle={-8} scale={1.05} headerTitle="EduManage Home" delay={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
            {/* Header Greeting */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Welcome back,</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#FFFFFF' }}>Apex Coaching</div>
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                  color: 'white',
                }}
              >
                AC
              </div>
            </div>

            {/* Quick Balance Hero Banner */}
            <div
              style={{
                backgroundColor: '#1E293B',
                borderRadius: 16,
                padding: 14,
                border: '1px solid rgba(79, 70, 229, 0.3)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Collected This Month</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#10B981', marginTop: 2 }}>
                ₹1,84,500
              </div>
              <div style={{ fontSize: 10, color: '#34D399', marginTop: 4 }}>
                Direct to Canara Bank • 0% cut
              </div>
            </div>

            {/* Action Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 10, color: '#94A3B8' }}>Attendance</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#38BDF8', marginTop: 2 }}>94%</div>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>Offline Ready</div>
              </div>

              <div
                style={{
                  backgroundColor: '#0F172A',
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontSize: 10, color: '#94A3B8' }}>Pending Dues</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B', marginTop: 2 }}>8 Due</div>
                <div style={{ fontSize: 9, color: '#94A3B8' }}>1-Tap Remind</div>
              </div>
            </div>

            {/* Recent Activity list */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 6 }}>
                Recent Collections
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { name: 'Rohan Sharma', amt: '₹4,500', time: '2m ago' },
                  { name: 'Sneha Patel', amt: '₹3,000', time: '14m ago' },
                  { name: 'Kunal Roy', amt: '₹5,000', time: '1h ago' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#1E293B',
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                    }}
                  >
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: '#64748B', fontSize: 9 }}>{item.time}</div>
                    </div>
                    <div style={{ color: '#10B981', fontWeight: 700 }}>{item.amt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PhoneMockup>
      </div>
    </div>
  );
};
