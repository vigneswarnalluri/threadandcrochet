import { Link } from '@/components/Link'
import React from 'react'
import Image from 'next/image'

export interface LogoProps extends React.ComponentPropsWithoutRef<'svg'> {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  return (
    <Link href="/" className={`flex items-center shrink-0 select-none ${className}`}>
      <Image
        src="/logo-final-v3.png"
        alt="Thread & Crochet Logo"
        width={420}
        height={112}
        className="h-[88px] lg:h-28 w-auto object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    </Link>
  )
}

export default Logo
