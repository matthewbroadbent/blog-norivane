import React from 'react'

interface LogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  }

  const primaryColor = variant === 'dark' ? '#0A2342' : '#FFFFFF'
  const accentColor = '#00B2A9'

  return (
    <div className={`font-montserrat ${sizeClasses[size]} font-medium tracking-tight select-none ${className}`}>
      <span style={{ color: primaryColor }}>nor</span>
      <span 
        style={{ 
          color: accentColor, 
          fontStyle: 'italic', 
          fontWeight: 400,
          position: 'relative',
          display: 'inline-block'
        }}
      >
        i
      </span>
      <span style={{ color: primaryColor }}>vane</span>
    </div>
  )
}
