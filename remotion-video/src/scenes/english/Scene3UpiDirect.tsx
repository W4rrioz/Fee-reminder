import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Check, ShieldAlert, ArrowRight, Banknote } from 'lucide-react';
import { BackgroundGradient } from '../../components/BackgroundGradient';
import { UpiCard } from '../../components/UpiCard';
import { THEME } from '../../constants/theme';

export const Scene3UpiDirect: React.FC = () => {
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
      <BackgroundGradient glowColor={THEME.colors.secondary} secondaryGlow={THEME.colors.primary} />

      {/* Left Feature Description */}
      <div style={{ maxWidth: 620, zIndex: 2 }}>
        {/* Zero Commission Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            borderRadius: 30,
            padding: '8px 20px',
            marginBottom: 20,
            opacity: interpolate(titleSpring, [0, 0.5], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#34D399', letterSpacing: 0.5 }}>
            0% COMMISSION • DIRECT TO BANK
          </span>
        </div>

        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.15,
            marginBottom: 18,
            opacity: interpolate(titleSpring, [0, 0.4], [0, 1]),
          }}
        >
          Zero Cuts. Zero Delays. <br />
          <span style={{ color: THEME.colors.secondaryLight }}>Instant Bank Deposit.</span>
        </h1>

        <p
          style={{
            fontSize: 21,
            color: '#CBD5E1',
            lineHeight: 1.5,
            marginBottom: 32,
            opacity: interpolate(titleSpring, [0, 0.6], [0, 1]),
          }}
        >
          No payment gateway holding your money for 3 days. Parents scan your dynamic UPI QR and funds settle immediately into your institute account.
        </p>

        {/* Comparison Callout */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 10,
          }}
        >
          {/* Other Gateways */}
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              backgroundColor: 'rgba(30, 41, 59, 0.6)',
              borderRadius: 16,
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              TRADITIONAL GATEWAYS
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FCA5A5' }}>
              2% to 3% Cut
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              T+2 settlement delays
            </div>
          </div>

          {/* EduManage */}
          <div
            style={{
              flex: 1,
              padding: '16px 20px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderRadius: 16,
              border: '2px solid #10B981',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
            }}
          >
            <div style={{ color: '#34D399', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
              EDUMANAGE DIRECT UPI
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>
              ₹0 Commission
            </div>
            <div style={{ fontSize: 11, color: '#A7F3D0', marginTop: 4 }}>
              Instant Direct Credit
            </div>
          </div>
        </div>
      </div>

      {/* Right Upi Card Graphic */}
      <div style={{ zIndex: 2 }}>
        <UpiCard
          amount={4500}
          studentName="Rahul Sharma (Class 10)"
          instituteName="Apex Science Academy"
          upiId="apexcoaching@icici"
          delay={10}
        />
      </div>
    </div>
  );
};
