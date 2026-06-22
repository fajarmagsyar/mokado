'use client'

// Nintendo-style floating geometric decorations — no emoji, pure CSS shapes
export function DecorBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {/* Large circle top-right */}
      <div
        className="float-a absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: 'var(--red)' }}
      />
      {/* Small circle bottom-left */}
      <div
        className="float-b absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-[0.05]"
        style={{ background: 'var(--navy)' }}
      />
      {/* Rotating square middle-left */}
      <div
        className="spin-slow absolute top-1/3 -left-8 w-24 h-24 opacity-[0.07]"
        style={{ background: 'var(--red)', borderRadius: '8px' }}
      />
      {/* Star shape top-left */}
      <Star className="float-c absolute top-20 left-16 w-10 h-10 opacity-[0.12]" color="var(--red)" />
      {/* Star bottom-right */}
      <Star className="float-a absolute bottom-32 right-20 w-8 h-8 opacity-[0.10]" color="var(--navy)" />
      {/* Dot grid */}
      <DotGrid className="absolute top-10 right-32 opacity-[0.08]" />
      <DotGrid className="absolute bottom-20 left-24 opacity-[0.06]" />
      {/* Small squares scattered */}
      <div
        className="float-b absolute top-1/2 right-12 w-6 h-6 opacity-[0.10]"
        style={{ background: 'var(--red)', borderRadius: '3px', transform: 'rotate(20deg)' }}
      />
      <div
        className="float-c absolute top-3/4 left-1/4 w-4 h-4 opacity-[0.08]"
        style={{ background: 'var(--navy)', borderRadius: '2px', transform: 'rotate(-15deg)' }}
      />
    </div>
  )
}

function Star({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
    </svg>
  )
}

function DotGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="60" height="60" viewBox="0 0 60 60" aria-hidden>
      {[0, 15, 30, 45].map(x =>
        [0, 15, 30, 45].map(y => (
          <circle key={`${x}-${y}`} cx={x + 5} cy={y + 5} r="2.5" fill="var(--red)" />
        ))
      )}
    </svg>
  )
}
