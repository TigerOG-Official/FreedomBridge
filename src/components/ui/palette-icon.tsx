interface PaletteIconProps {
  size?: number;
}

export function PaletteIcon({ size = 24 }: PaletteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3c-4.97 0-9 3.58-9 8 0 2.05 1.06 4.32 3 5 1.5.53 2 1 2 2v1c0 .55.45 1 1 1h5c3.87 0 7-3.13 7-7s-3.13-7-7-7z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="8.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
      <circle cx="14.5" cy="14.5" r="1" />
    </svg>
  );
}
