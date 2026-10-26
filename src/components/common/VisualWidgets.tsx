import React from 'react';
import { Award, Bike, Dumbbell, Flame, Shield, Trophy } from 'lucide-react';

interface RadialGaugeProps {
  pct: number;
  size: number;
  strokeWidth: number;
  color: string;
  centerLabel: string | number;
  subLabel?: string;
  trackColor?: string;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  pct,
  size,
  strokeWidth,
  color,
  centerLabel,
  subLabel = '',
  trackColor = 'var(--bg-elevated)',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference.toFixed(1)}
          strokeDashoffset={dashOffset.toFixed(1)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span
          className="tabular-nums"
          style={{
            fontSize: size >= 80 ? '20px' : '13px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          {centerLabel}
        </span>
        {subLabel && (
          <span
            style={{
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginTop: '2px',
            }}
          >
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
};

interface HexBadgeProps {
  color: string;
  icon: 'bike' | 'dumbbell' | 'flame' | 'trophy' | 'shield' | 'award';
}

export const HexBadge: React.FC<HexBadgeProps> = ({ color, icon }) => {
  const IconComp =
    icon === 'bike'
      ? Bike
      : icon === 'dumbbell'
      ? Dumbbell
      : icon === 'flame'
      ? Flame
      : icon === 'trophy'
      ? Trophy
      : icon === 'shield'
      ? Shield
      : Award;

  return (
    <div className="hex-icon-wrap">
      <svg width="52" height="52" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon
          points="30,3 54,17 54,43 30,57 6,43 6,17"
          fill={color}
          fillOpacity="0.16"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <polygon points="30,9 48,20 48,40 30,51 12,40 12,20" fill={color} fillOpacity="0.08" />
      </svg>
      <IconComp size={20} style={{ color, position: 'absolute' }} />
    </div>
  );
};

export const SportMateMark: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="40" height="40" rx="12" fill="#151722" />
    <rect x="0.5" y="0.5" width="39" height="39" rx="11.5" stroke="white" strokeOpacity="0.12" />
    <circle cx="16.5" cy="20" r="7.5" stroke="#F5F6FA" strokeWidth="3.2" />
    <circle cx="23.5" cy="20" r="7.5" stroke="#3ED6A3" strokeWidth="3.2" />
  </svg>
);
