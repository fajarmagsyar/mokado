export function FlagIcon({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="64" height="64" rx="14" fill="#FAF9F6"/>
      <rect x="4" y="9" width="32" height="46" rx="6" fill="#047857" transform="rotate(-13 20 32)"/>
      <rect x="6.5" y="11.5" width="27" height="41" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" transform="rotate(-13 20 32)"/>
      <path d="M9.5 18 L12.5 22 L9.5 26 L6.5 22 Z" fill="rgba(255,255,255,0.7)" transform="rotate(-13 20 32)"/>
      <rect x="28" y="9" width="32" height="46" rx="6" fill="#B91C1C" transform="rotate(9 44 32)"/>
      <rect x="30.5" y="11.5" width="27" height="41" rx="4" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" transform="rotate(9 44 32)"/>
      <path d="M34 18 L37 22 L34 26 L31 22 Z" fill="rgba(255,255,255,0.75)" transform="rotate(9 44 32)"/>
      <text x="44" y="36" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="18" fontWeight="900" fontFamily="system-ui,sans-serif" letterSpacing="-1" transform="rotate(9 44 32)">M</text>
    </svg>
  )
}
