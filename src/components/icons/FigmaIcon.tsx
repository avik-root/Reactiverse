
import type React from 'react';

const FigmaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 17.25C14.8995 17.25 17.25 14.8995 17.25 12C17.25 9.10051 14.8995 6.75 12 6.75V12H12Z"
      fill="#0ACF83"
    />
    <path
      d="M6.75 12C6.75 9.10051 9.10051 6.75 12 6.75V12H6.75Z"
      fill="#A259FF"
    />
    <path
      d="M6.75 12C6.75 14.8995 9.10051 17.25 12 17.25V12H6.75Z"
      fill="#F24E1E"
    />
    <path
      d="M12 6.75C9.10051 6.75 6.75 9.10051 6.75 12H12V6.75Z"
      fill="#FF7262"
    />
    <path
      d="M12 17.25C14.8995 17.25 17.25 14.8995 17.25 12H12V17.25Z"
      fill="#1ABCFE"
    />
  </svg>
);

export default FigmaIcon;
