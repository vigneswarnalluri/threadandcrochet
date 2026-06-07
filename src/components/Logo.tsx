import { Link } from '@/components/Link'
import React from 'react'

export interface LogoProps extends React.ComponentPropsWithoutRef<'svg'> {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = 'shrink-0' }) => {
  return (
    <Link href="/" className={`flex items-center shrink-0 select-none ${className}`}>
      <span className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-primary-500 hover:text-primary-600 transition-colors duration-150">
        Thread & Crochet
      </span>
    </Link>
  )
}

export default Logo
