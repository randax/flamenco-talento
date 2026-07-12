import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
}

// The wordmark is the brand identity itself (no CMS field maps to it), so it
// stays as a constant here rather than being pulled from Sanity.
export function Logo({ className = "", iconSize = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-flamenco-red"
      >
        <path
          d="M12 22C12 22 19 18 21 12C23 6 18 2 12 2C6 2 1 6 3 12C5 18 12 22 12 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L18.5 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L5.5 6.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L20 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 12L4 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="22" r="2" fill="currentColor" />
      </svg>
      <span className="font-serif font-bold tracking-wider text-white">
        FLAMENCO <span className="text-flamenco-red italic">TALENTO</span>
      </span>
    </div>
  );
}
