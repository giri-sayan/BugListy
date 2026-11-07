import React from 'react';

export default function BugListLogo({ size = 20, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer checklist terminal container */}
      <rect 
        x="5" 
        y="4" 
        width="14" 
        height="16" 
        rx="3" 
        className="stroke-current"
      />
      {/* Subtle antennae */}
      <path d="M8 4L6 2" className="stroke-current opacity-60" />
      <path d="M16 4L18 2" className="stroke-current opacity-60" />
      {/* Subtle legs */}
      <path d="M5 9H3" className="stroke-current opacity-40" />
      <path d="M21 9H19" className="stroke-current opacity-40" />
      <path d="M5 15H3" className="stroke-current opacity-40" />
      <path d="M21 15H19" className="stroke-current opacity-40" />
      {/* Checked bug list rows */}
      <path d="M8.5 9L10 10.5L12 8" className="stroke-emerald-500" strokeWidth="1.75" />
      <line x1="13.5" y1="9.5" x2="16" y2="9.5" className="stroke-current opacity-80" />
      <path d="M8.5 14L10 15.5L12 13" className="stroke-emerald-500" strokeWidth="1.75" />
      <line x1="13.5" y1="14.5" x2="15.5" y2="14.5" className="stroke-current opacity-80" />
    </svg>
  );
}
