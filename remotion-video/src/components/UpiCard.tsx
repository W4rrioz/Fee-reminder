import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { THEME } from '../constants/theme';

export interface UpiCardProps {
  amount?: number;
  studentName?: string;
  instituteName?: string;
  upiId?: string;
  delay?: number;
  showSuccess?: boolean;
}

export const UpiCard: React.FC<UpiCardProps> = ({
  amount = 4500,
  studentName = 'Rahul Sharma (Class 10)',
  instituteName = 'Apex Coaching Institute',
  upiId = 'apexcoaching@icici',
  delay = 0,
  showSuccess = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Success state triggers after 35 frames from entrance
  const successEntrance = spring({
    frame: frame - delay - 35,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(entrance, [0, 0.3], [0, 1]);

  return (
    <div
      style={{
        width: 320,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        padding: 20,
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {/* 0% Commission Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          padding: '4px 12px',
          borderRadius: 20,
          marginBottom: 14,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#34D399', letterSpacing: 0.5 }}>
          0% GATEWAY COMMISSION • DIRECT UPI
        </span>
      </div>

      {/* Institute Info */}
      <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 2 }}>
        {instituteName}
      </div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>
        UPI ID: <span style={{ color: '#818CF8' }}>{upiId}</span>
      </div>

      {/* Styled QR Code Box with animated scanning laser */}
      <div
        style={{
          width: 170,
          height: 170,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 12,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Synthetic high-detail QR Matrix graphics */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: 'repeat(7, 1fr)',
            gap: 4,
          }}
        >
          {Array.from({ length: 49 }).map((_, i) => {
            // Corners have finder patterns
            const isCorner =
              (i < 3 || (i >= 7 && i <= 9) || (i >= 14 && i <= 16)) ||
              (i % 7 >= 4 && i < 21) ||
              (i >= 28 && i % 7 < 3);
            const isFilled = isCorner || (i * 17 + 11) % 5 > 1;

            return (
              <div
                key={i}
                style={{
                  backgroundColor: isFilled ? '#0F172A' : '#F1F5F9',
                  borderRadius: 3,
                }}
              />
            );
          })}
        </div>

        {/* Center UPI Logo Icon */}
        <div
          style={{
            position: 'absolute',
            width: 36,
            height: 36,
            backgroundColor: '#0F172A',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B',
            fontWeight: 900,
            fontSize: 12,
            border: '2px solid white',
          }}
        >
          UPI
        </div>

        {/* Animated Laser Scanning Beam */}
        <div
          style={{
            position: 'absolute',
            top: `${interpolate(
              Math.sin((frame - delay) * 0.1),
              [-1, 1],
              [0, 150]
            )}px`,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: '#10B981',
            boxShadow: '0 0 10px #10B981, 0 0 20px #10B981',
            opacity: 0.85,
          }}
        />
      </div>

      {/* Payment details summary */}
      <div
        style={{
          width: '100%',
          marginTop: 16,
          padding: '10px 14px',
          backgroundColor: '#0F172A',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#94A3B8' }}>{studentName}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#F8FAFC' }}>
            ₹{amount.toLocaleString('en-IN')}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: '#10B981',
          }}
        >
          <span>Direct Pay</span>
          <ArrowRight size={14} />
        </div>
      </div>

      {/* Instant Success Banner overlay */}
      {showSuccess && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            right: 20,
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            padding: '10px 14px',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.6)',
            transform: `translateY(${interpolate(
              successEntrance,
              [0, 1],
              [30, 0]
            )}px) scale(${interpolate(successEntrance, [0, 1], [0.9, 1])})`,
            opacity: interpolate(successEntrance, [0, 0.3], [0, 1]),
          }}
        >
          <CheckCircle2 size={24} color="#FFFFFF" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800 }}>₹{amount} CREDITED INSTANTLY</div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>Direct to Institute Bank • 0% Cut</div>
          </div>
        </div>
      )}
    </div>
  );
};
