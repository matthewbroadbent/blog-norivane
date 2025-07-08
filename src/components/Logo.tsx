import React from 'react'

interface LogoProps {
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  const textColor = variant === 'dark' ? '#0A2342' : '#FFFFFF'
  const accentColor = '#00B2A9'

  return (
    <div className={`font-montserrat ${sizeClasses[size]} font-medium tracking-tight`}>
      <span style={{ color: textColor }}>nor</span>
      <span style={{ color: accentColor, fontStyle: 'italic', fontWeight: 400 }}>i</span>
      <span style={{ color: textColor }}>vane</span>
    </div>
  )
}
