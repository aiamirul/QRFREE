import React from 'react';

interface KanikaLogoProps {
  className?: string;
  size?: number;
}

export const KanikaLogo: React.FC<KanikaLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
      >
        <defs>
          <linearGradient id="kanikaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="kanikaGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Container with subtle border glow */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="22"
          fill="#090d16"
          stroke="url(#kanikaGrad)"
          strokeWidth="3"
        />

        {/* QR Corner Finder Eyes stylized */}
        {/* Top-Left Finder */}
        <rect x="14" y="14" width="22" height="22" rx="6" fill="#1e1b4b" stroke="url(#kanikaGrad)" strokeWidth="2.5" />
        <rect x="20" y="20" width="10" height="10" rx="2.5" fill="#818cf8" />

        {/* Top-Right Finder */}
        <rect x="64" y="14" width="22" height="22" rx="6" fill="#1e1b4b" stroke="url(#kanikaGrad)" strokeWidth="2.5" />
        <rect x="70" y="20" width="10" height="10" rx="2.5" fill="#ec4899" />

        {/* Bottom-Left Finder */}
        <rect x="14" y="64" width="22" height="22" rx="6" fill="#1e1b4b" stroke="url(#kanikaGrad)" strokeWidth="2.5" />
        <rect x="20" y="70" width="10" height="10" rx="2.5" fill="#38bdf8" />

        {/* Stylized 'K' Monogram in Center-Right */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* Vertical Stem of K */}
          <path
            d="M45 32V68"
            stroke="url(#kanikaGrad)"
            strokeWidth="7"
          />
          {/* Upper Diagonal of K */}
          <path
            d="M45 50L68 32"
            stroke="url(#kanikaGrad)"
            strokeWidth="6.5"
          />
          {/* Lower Diagonal of K */}
          <path
            d="M51 47L71 68"
            stroke="url(#kanikaGrad)"
            strokeWidth="6.5"
          />
        </g>

        {/* Micro Tech Matrix Dots */}
        <circle cx="58" cy="22" r="2.5" fill="#a78bfa" />
        <circle cx="78" cy="52" r="2.5" fill="#f472b6" />
        <circle cx="48" cy="78" r="2.5" fill="#38bdf8" />
      </svg>
    </div>
  );
};
