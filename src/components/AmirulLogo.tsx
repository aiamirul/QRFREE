import React from 'react';

interface AmirulLogoProps {
  className?: string;
  size?: number;
}

export const AmirulLogo: React.FC<AmirulLogoProps> = ({ className = 'w-8 h-8', size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
      >
        <defs>
          <linearGradient id="amirulGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="45%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="amirulAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* Outer Rounded Tile Container */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="22"
          fill="#090d16"
          stroke="url(#amirulGrad)"
          strokeWidth="3.2"
        />

        {/* QR Corner Finder Eyes */}
        {/* Top-Left Finder */}
        <rect x="14" y="14" width="22" height="22" rx="6" fill="#062820" stroke="url(#amirulGrad)" strokeWidth="2.5" />
        <rect x="20" y="20" width="10" height="10" rx="2.5" fill="#34d399" />

        {/* Top-Right Finder */}
        <rect x="64" y="14" width="22" height="22" rx="6" fill="#08283b" stroke="url(#amirulGrad)" strokeWidth="2.5" />
        <rect x="70" y="20" width="10" height="10" rx="2.5" fill="#38bdf8" />

        {/* Bottom-Left Finder */}
        <rect x="14" y="64" width="22" height="22" rx="6" fill="#131e42" stroke="url(#amirulGrad)" strokeWidth="2.5" />
        <rect x="20" y="70" width="10" height="10" rx="2.5" fill="#818cf8" />

        {/* Stylized 'A' Monogram for AmirulQR */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* Left Leg of A */}
          <path
            d="M38 72L56 26"
            stroke="url(#amirulGrad)"
            strokeWidth="7"
          />
          {/* Right Leg of A */}
          <path
            d="M56 26L74 72"
            stroke="url(#amirulGrad)"
            strokeWidth="7"
          />
          {/* Crossbar of A */}
          <path
            d="M44 54H68"
            stroke="url(#amirulAccent)"
            strokeWidth="6"
          />
        </g>

        {/* Infinity / Foreva sparkle loop dot */}
        <circle cx="56" cy="38" r="3.2" fill="#34d399" />
        <circle cx="78" cy="54" r="2.5" fill="#38bdf8" />
        <circle cx="48" cy="78" r="2.5" fill="#818cf8" />
      </svg>
    </div>
  );
};
