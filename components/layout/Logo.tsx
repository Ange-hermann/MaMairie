import React from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'light' }) => {
  const dimensions = {
    sm: { width: 120, height: 40 },
    md: { width: 150, height: 50 },
    lg: { width: 180, height: 60 },
  }
  
  return (
    <div className="flex items-center">
      <Image
        src="/logo-mamairie.png"
        alt="MaMairie Logo"
        width={dimensions[size].width}
        height={dimensions[size].height}
        className="object-contain"
        priority
      />
    </div>
  )
}
