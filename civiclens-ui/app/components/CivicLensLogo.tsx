import React from 'react';

interface CivicLensLogoProps {
  className?: string;
  /** When true, renders a compact horizontal version for the navbar */
  inline?: boolean;
}

const CivicLensLogo = ({ className = "w-32 h-auto", inline = false }: CivicLensLogoProps) => {
  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Small shield icon */}
        <svg
          viewBox="0 0 200 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '36px', height: '36px', flexShrink: 0 }}
        >
          <path
            d="M100 10L30 40V110C30 155 100 200 100 200C100 200 170 155 170 110V40L100 10Z"
            fill="#0f2444"
          />
          <path
            d="M100 10L170 40V110C170 125 160 140 150 152L100 85V10Z"
            fill="#c9973a"
            opacity="0.8"
          />
          <path
            d="M135 75C128 65 115 60 100 60C75 60 55 80 55 110C55 140 75 160 100 160C115 160 128 155 135 145"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M80 115C80 105 89 98 100 98C111 98 120 105 120 115V135H80V115Z"
            fill="white"
          />
          <rect x="85" y="135" width="4" height="10" fill="white" />
          <rect x="98" y="135" width="4" height="10" fill="white" />
          <rect x="111" y="135" width="4" height="10" fill="white" />
        </svg>
        {/* Compact text */}
        <div style={{ lineHeight: 1 }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            color: '#0f2444',
            letterSpacing: '-0.02em',
          }}>
            CIVIC
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: '18px',
            color: '#c9973a',
            letterSpacing: '-0.02em',
          }}>
            LENS
          </span>
        </div>
      </div>
    );
  }

  // Original vertical layout (used in hero section etc.)
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <path
          d="M100 10L30 40V110C30 155 100 200 100 200C100 200 170 155 170 110V40L100 10Z"
          fill="#1E4B6B"
        />
        <path
          d="M100 10L170 40V110C170 125 160 140 150 152L100 85V10Z"
          fill="#C5A059"
          opacity="0.8"
        />
        <path
          d="M135 75C128 65 115 60 100 60C75 60 55 80 55 110C55 140 75 160 100 160C115 160 128 155 135 145"
          stroke="white"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M80 115C80 105 89 98 100 98C111 98 120 105 120 115V135H80V115Z"
          fill="white"
        />
        <rect x="85" y="135" width="4" height="10" fill="white" />
        <rect x="98" y="135" width="4" height="10" fill="white" />
        <rect x="111" y="135" width="4" height="10" fill="white" />
      </svg>
      
      <div className="text-center mt-2">
        <h1 className="text-[#1E4B6B] font-bold text-2xl tracking-tighter leading-none">
          CIVIC<span className="font-light">LENS</span>
        </h1>
        <p className="text-[#666] text-[8px] uppercase tracking-[0.2em] font-medium">
          Public Insight &amp; Governance
        </p>
      </div>
    </div>
  );
};

export default CivicLensLogo;
