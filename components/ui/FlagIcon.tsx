// SVG flag-on-pole icon — no emoji
export function FlagIcon({
  size = 32,
  color = 'var(--red)',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Pole */}
      <rect x="6" y="2" width="2.5" height="28" rx="1.25" fill={color === 'var(--red)' ? '#1A1A2E' : color} opacity="0.7" />
      {/* Flag */}
      <path d="M8.5 4 L26 10 L8.5 18 Z" fill={color} />
    </svg>
  )
}
