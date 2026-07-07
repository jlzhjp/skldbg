import type { SVGProps } from "react";

export function SkillDebuggerLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className} {...props}>
      <defs>
        <linearGradient id="logo-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="logo-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ec4899", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#f43f5e", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="logo-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#0ea5e9", stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <line
        x1="128"
        y1="76"
        x2="80"
        y2="168"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <line
        x1="128"
        y1="76"
        x2="176"
        y2="168"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <line
        x1="80"
        y1="168"
        x2="176"
        y2="168"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="12"
        strokeLinecap="round"
      />

      <circle cx="128" cy="76" r="28" fill="url(#logo-grad1)" />
      <circle cx="80" cy="168" r="28" fill="url(#logo-grad2)" />
      <circle cx="176" cy="168" r="28" fill="url(#logo-grad3)" />

      <circle cx="128" cy="76" r="12" fill="#ffffff" />
      <circle cx="80" cy="168" r="12" fill="#ffffff" />
      <circle cx="176" cy="168" r="12" fill="#ffffff" />
    </svg>
  );
}
