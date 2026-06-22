'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', style, ...props }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          background: '#F9FAFB',
          border: `2px solid ${error ? 'var(--red)' : '#E5E7EB'}`,
          borderRadius: 12,
          padding: '12px 16px',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'inherit',
          color: 'var(--navy)',
          outline: 'none',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => {
          e.target.style.borderColor = error ? 'var(--red)' : 'var(--red)'
          e.target.style.background = '#fff'
        }}
        onBlur={e => {
          e.target.style.borderColor = error ? 'var(--red)' : '#E5E7EB'
          e.target.style.background = '#F9FAFB'
        }}
        className={className}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--red)', fontSize: 12, fontWeight: 600 }}>{error}</p>
      )}
    </div>
  )
}
