import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Send, CheckCheck, IndianRupee } from 'lucide-react';
import { THEME } from '../constants/theme';

export interface WhatsAppReminderProps {
  studentName?: string;
  parentName?: string;
  amount?: number;
  month?: string;
  instituteName?: string;
  delay?: number;
}

export const WhatsAppReminder: React.FC<WhatsAppReminderProps> = ({
  studentName = 'Aarav Gupta',
  parentName = 'Mr. Rajesh Gupta',
  amount = 3200,
  month = 'October 2026',
  instituteName = 'Smart Learners Academy',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const tapEffect = spring({
    frame: frame - delay - 25,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const bubbleEntrance = spring({
    frame: frame - delay - 32,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const cardScale = interpolate(entrance, [0, 1], [0.88, 1]);
  const cardOpacity = interpolate(entrance, [0, 0.3], [0, 1]);

  return (
    <div
      style={{
        width: 340,
        backgroundColor: '#0B141A',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(37, 211, 102, 0.25)',
        transform: `scale(${cardScale})`,
        opacity: cardOpacity,
        fontFamily: THEME.typography.fontFamily,
      }}
    >
      {/* WhatsApp Header */}
      <div
        style={{
          backgroundColor: '#1F2C34',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: '#00A884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            color: '#FFFFFF',
            fontSize: 14,
          }}
        >
          {parentName[4] || 'P'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#E9EDEF', fontSize: 13, fontWeight: 700 }}>
            {parentName} (Parent)
          </div>
          <div style={{ color: '#8696A0', fontSize: 10 }}>
            Student: {studentName}
          </div>
        </div>
        <div
          style={{
            backgroundColor: '#25D366',
            color: '#0B141A',
            padding: '2px 8px',
            borderRadius: 10,
            fontSize: 9,
            fontWeight: 800,
          }}
        >
          1-TAP WA
        </div>
      </div>

      {/* Chat Background with conversation bubbles */}
      <div
        style={{
          padding: 16,
          backgroundColor: '#0B141A',
          minHeight: 250,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Animated 1-Tap Trigger Button above message */}
        <div
          style={{
            alignSelf: 'center',
            backgroundColor: '#4F46E5',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transform: `scale(${interpolate(tapEffect, [0, 0.5, 1], [1, 0.92, 1])})`,
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
          }}
        >
          <Send size={12} />
          <span>EduManage 1-Tap Reminder Dispatched</span>
        </div>

        {/* The Outgoing WhatsApp Fee Message Bubble */}
        <div
          style={{
            alignSelf: 'flex-end',
            maxWidth: '88%',
            backgroundColor: '#005C4B',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 14px',
            color: '#E9EDEF',
            fontSize: 12,
            lineHeight: 1.45,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: `translateY(${interpolate(bubbleEntrance, [0, 1], [20, 0])}px) scale(${interpolate(bubbleEntrance, [0, 1], [0.92, 1])})`,
            opacity: interpolate(bubbleEntrance, [0, 0.3], [0, 1]),
          }}
        >
          <div style={{ fontWeight: 700, color: '#25D366', marginBottom: 4 }}>
            {instituteName}
          </div>
          <div>
            Dear {parentName}, fee for <b>{studentName}</b> for {month} is due.
          </div>

          {/* Fee Amount Callout */}
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              borderRadius: 8,
              padding: '8px 10px',
              marginTop: 8,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, color: '#8696A0' }}>Due Amount:</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC' }}>
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Clickable UPI Instant Link inside message */}
          <div
            style={{
              backgroundColor: '#128C7E',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <IndianRupee size={12} />
            <span>Pay ₹{amount} via Direct UPI Link</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 4,
              marginTop: 6,
              fontSize: 10,
              color: '#8696A0',
            }}
          >
            <span>9:42 AM</span>
            <CheckCheck size={14} color="#53BDEB" />
          </div>
        </div>
      </div>
    </div>
  );
};
