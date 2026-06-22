'use client'

const COLORS = [
  '#DC1B2E', '#2563EB', '#059669', '#D97706',
  '#7C3AED', '#DB2777', '#0891B2', '#65A30D',
]

export function PlayerAvatar({ name, index, size = 36 }: { name: string; index: number; size?: number }) {
  const color = COLORS[index % COLORS.length]
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 900,
        fontSize: size * 0.36,
        flexShrink: 0,
        boxShadow: `0 2px 8px ${color}55`,
      }}
    >
      {initials}
    </div>
  )
}
