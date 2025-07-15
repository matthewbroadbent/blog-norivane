import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
}

export function Logo({ size = 'md', variant = 'light' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  const colorClasses = {
    light: 'text-white',
    dark: 'text-gray-900'
  }

  return (
    <div className={`font-bold ${sizeClasses[size]} ${colorClasses[variant]}`}>
      <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
        Norivane
      </span>
    </div>
  )
}
