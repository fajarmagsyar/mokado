'use client'

import { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variants = {
  primary: {
    bg: 'var(--red)',
    shadow: '0 4px 0 var(--red-dark)',
    color: '#fff',
    hoverBg: 'var(--red-dark)',
  },
  secondary: {
    bg: '#fff',
    shadow: '0 4px 0 #d1d5db',
    color: 'var(--navy)',
    hoverBg: '#f9fafb',
  },
  ghost: {
    bg: 'transparent',
    shadow: 'none',
    color: 'var(--navy)',
    hoverBg: 'rgba(0,0,0,0.05)',
  },
  danger: {
    bg: '#7f1d1d',
    shadow: '0 4px 0 #450a0a',
    color: '#fff',
    hoverBg: '#991b1b',
  },
}

const sizes = {
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
  md: { padding: '11px 22px', fontSize: '14px', borderRadius: '12px' },
  lg: { padding: '15px 28px', fontSize: '16px', borderRadius: '14px' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const v = variants[variant]
  const s = sizes[size]

  return (
    <motion.button
      whileTap={{ scale: 0.94, y: 3 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      disabled={disabled || loading}
      style={{
        background: v.bg,
        boxShadow: v.shadow,
        color: v.color,
        fontFamily: 'inherit',
        fontWeight: 800,
        letterSpacing: '0.01em',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.55 : 1,
        transition: 'background 0.15s',
        ...s,
        ...style,
      }}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spinner />
          Memuat...
        </span>
      ) : children}
    </motion.button>
  )
}

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTop: '2px solid #fff',
        borderRadius: '50%',
      }}
    />
  )
}
