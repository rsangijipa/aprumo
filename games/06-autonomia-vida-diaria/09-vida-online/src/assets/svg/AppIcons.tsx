import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const PulseIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#pulse-grad)" />
    <path d="M18 34c0-7.732 6.268-14 14-14s14 6.268 14 14c0 3.32-1.157 6.37-3.1 8.78L44 47l-5.32-1.78A13.93 13.93 0 0 1 32 48c-7.732 0-14-6.268-14-14z" fill="#FFFFFF" />
    <path d="M26 34h3l3-6 4 12 3-6h5" stroke="#536DFE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="pulse-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#536DFE" />
        <stop offset="1" stopColor="#3D5AFE" />
      </linearGradient>
    </defs>
  </svg>
);

export const LoopIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#loop-grad)" />
    <circle cx="32" cy="32" r="16" stroke="#FFFFFF" strokeWidth="4.5" strokeDasharray="22 10" strokeLinecap="round" />
    <circle cx="32" cy="32" r="7" fill="#FFFFFF" />
    <defs>
      <linearGradient id="loop-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B75D7" />
        <stop offset="1" stopColor="#765EC4" />
      </linearGradient>
    </defs>
  </svg>
);

export const PlayHubIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#playhub-grad)" />
    <path d="M20 28c0-4.418 3.582-8 8-8h8c4.418 0 8 3.582 8 8v8c0 4.418-3.582 8-8 8H28c-4.418 0-8-3.582-8-8v-8z" fill="#FFFFFF" />
    {/* D-Pad e Botões */}
    <path d="M28 28v8M24 32h8" stroke="#E16C68" strokeWidth="3" strokeLinecap="round" />
    <circle cx="38" cy="30" r="2" fill="#E16C68" />
    <circle cx="42" cy="34" r="2" fill="#E16C68" />
    <defs>
      <linearGradient id="playhub-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E16C68" />
        <stop offset="1" stopColor="#C95753" />
      </linearGradient>
    </defs>
  </svg>
);

export const VaultIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#vault-grad)" />
    <path d="M32 18l14 5.5v10.2c0 8.8-5.9 17-14 19.3-8.1-2.3-14-10.5-14-19.3V23.5L32 18z" fill="#FFFFFF" />
    <circle cx="32" cy="32" r="4.5" fill="#359889" />
    <path d="M32 36.5v4" stroke="#359889" strokeWidth="3" strokeLinecap="round" />
    <defs>
      <linearGradient id="vault-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#45B5A4" />
        <stop offset="1" stopColor="#359889" />
      </linearGradient>
    </defs>
  </svg>
);

export const MailboxIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#mailbox-grad)" />
    <rect x="18" y="22" width="28" height="20" rx="4" fill="#FFFFFF" />
    <path d="M19 23l13 10 13-10" stroke="#344052" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="mailbox-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#344052" />
        <stop offset="1" stopColor="#20252C" />
      </linearGradient>
    </defs>
  </svg>
);

export const FeedIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#feed-grad)" />
    <rect x="19" y="19" width="18" height="18" rx="4" fill="#FFFFFF" />
    <rect x="41" y="19" width="6" height="6" rx="2" fill="#FFFFFF" />
    <rect x="41" y="28" width="6" height="6" rx="2" fill="#FFFFFF" />
    <rect x="19" y="41" width="28" height="5" rx="2.5" fill="#FFFFFF" />
    <defs>
      <linearGradient id="feed-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4A596F" />
        <stop offset="1" stopColor="#344052" />
      </linearGradient>
    </defs>
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#settings-grad)" />
    <path d="M32 24v16M24 32h16" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
    <circle cx="32" cy="32" r="11" stroke="#FFFFFF" strokeWidth="4" />
    <defs>
      <linearGradient id="settings-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#64748B" />
        <stop offset="1" stopColor="#475569" />
      </linearGradient>
    </defs>
  </svg>
);

export const DetectiveIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
    <rect width="64" height="64" rx="18" fill="url(#detective-grad)" />
    <circle cx="29" cy="29" r="11" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M37 37l9 9" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
    <circle cx="29" cy="29" r="4" fill="#45B5A4" />
    <defs>
      <linearGradient id="detective-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2A3444" />
        <stop offset="1" stopColor="#1B2129" />
      </linearGradient>
    </defs>
  </svg>
);
