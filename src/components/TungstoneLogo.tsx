interface TungstoneLogoProps {
  size?: number;
  className?: string;
}

export function TungstoneLogo({ size = 28, className = '' }: TungstoneLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect width="64" height="64" rx="8" fill="#23272B" />
      <path d="M14 14H50V24H37V50H27V24H14V14Z" fill="#E4E2DC" />
      <rect x="27" y="14" width="10" height="10" fill="#C6F432" />
      <rect x="41" y="42" width="9" height="8" fill="#C6F432" />
    </svg>
  );
}
