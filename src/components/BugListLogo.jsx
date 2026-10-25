import React from 'react';

export default function BugListLogo({ size = 28, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gradient for Carapace / Card Border */}
        <linearGradient id="blGrad" x1="6" y1="6" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>

        {/* Body Fill */}
        <linearGradient id="blBodyDark" x1="8" y1="8" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#131B2E" />
          <stop offset="1" stopColor="#090E1A" />
        </linearGradient>
      </defs>

      {/* 1. ANTENNAE */}
      <path 
        d="M 12 7.5 C 10.5 4 7.5 3.5 5.5 5" 
        stroke="currentColor" 
        strokeWidth="1.75" 
        strokeLinecap="round" 
      />
      <circle cx="5" cy="5.5" r="1.25" fill="#10B981" />

      <path 
        d="M 20 7.5 C 21.5 4 24.5 3.5 26.5 5" 
        stroke="currentColor" 
        strokeWidth="1.75" 
        strokeLinecap="round" 
      />
      <circle cx="27" cy="5.5" r="1.25" fill="#3B82F6" />

      {/* 2. LEGS (6 Insect Legs) */}
      {/* Front Legs */}
      <path d="M 7.5 12 L 3 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M 24.5 12 L 29 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

      {/* Middle Legs */}
      <path d="M 7.5 17.5 L 2.5 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M 24.5 17.5 L 29.5 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

      {/* Back Legs */}
      <path d="M 7.5 23 L 3 25.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M 24.5 23 L 29 25.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />

      {/* 3. HEAD */}
      <path 
        d="M 11 7.5 C 11 5.5 21 5.5 21 7.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />

      {/* 4. CHECKLIST CARAPACE (Body) */}
      <rect 
        x="7" 
        y="7.5" 
        width="18" 
        height="19" 
        rx="4.5" 
        fill="url(#blBodyDark)" 
        stroke="url(#blGrad)" 
        strokeWidth="1.75" 
      />

      {/* 5. CHECKLIST CONTENT (Tasks & Checkmarks) */}
      {/* Row 1: Checkmark 1 + Bar */}
      <path 
        d="M 10.5 12.5 L 12 14 L 14.5 11" 
        stroke="#10B981" 
        strokeWidth="1.6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <rect x="16.5" y="12" width="5.5" height="1.8" rx="0.9" fill="#94A3B8" />

      {/* Row 2: Checkmark 2 + Bar */}
      <path 
        d="M 10.5 17 L 12 18.5 L 14.5 15.5" 
        stroke="#10B981" 
        strokeWidth="1.6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <rect x="16.5" y="16.5" width="4.5" height="1.8" rx="0.9" fill="#94A3B8" />

      {/* Row 3: Pending Checkbox Bullet + Bar */}
      <circle cx="12.5" cy="21.5" r="1.5" fill="#38BDF8" />
      <rect x="16.5" y="20.7" width="6" height="1.8" rx="0.9" fill="#64748B" />
    </svg>
  );
}
