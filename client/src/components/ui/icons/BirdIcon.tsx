interface BirdIconProps {
  className?: string;
}

export function BirdIcon({ className }: BirdIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bird body */}
      <path
        d="M3 8C3 8 4 6 6 6C8 6 9 7 9 7L11 5C11 5 12 4 13 5C13 5 13 6 12 7L10 9C10 9 10 11 9 12C8 13 6 13 5 12C4 11 3 10 3 8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wing */}
      <path
        d="M6 8C6 8 7 9 8 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Eye */}
      <circle cx="7" cy="7.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
