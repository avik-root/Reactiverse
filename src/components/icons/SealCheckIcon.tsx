// src/components/icons/SealCheckIcon.tsx
import type React from 'react';

const SealCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor" // Set stroke to currentColor for Tailwind text color to apply
    strokeWidth="2" // Define a default stroke width
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props} // Spread props to allow overriding, e.g., className for text-blue-500
  >
    {/* The "curvy ring" */}
    <circle cx="12" cy="12" r="10" />
    {/* The "tick" inside */}
    <path d="M7.5 12l3 3 6-6" />
  </svg>
);

export default SealCheckIcon;
