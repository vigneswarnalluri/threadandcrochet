'use client'

import { ArrowUpIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleScroll = () => {
    // Show button when page is scrolled down past 300px
    if (window.scrollY > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }

    // Calculate scroll progress percentage
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight
    if (totalScroll > 0) {
      const percent = (window.scrollY / totalScroll) * 100
      setProgress(percent)
    } else {
      setProgress(0)
    }
  }

  const scrollToTop = () => {
    const isTest = typeof navigator !== 'undefined' && navigator.webdriver
    window.scrollTo({
      top: 0,
      behavior: isTest ? 'auto' : 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    // Run once initially to capture state on mount/refresh
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Circumference of the progress ring
  // R = 20 => C = 2 * PI * 20 = 125.66
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      <button
        type="button"
        onClick={scrollToTop}
        className={`group relative flex size-12 cursor-pointer items-center justify-center rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 shadow-md transition-all duration-500 ease-out hover:scale-110 active:scale-95 hover:shadow-[0_0_20px_rgba(192,124,101,0.35)] dark:hover:shadow-[0_0_20px_rgba(192,124,101,0.25)] ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-75 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        {/* Glow Ring Effect */}
        <div className="absolute inset-0 rounded-full bg-primary-500/10 opacity-0 scale-75 blur-[2px] transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-110" />

        {/* Progress SVG Ring */}
        <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-400, #d99180)" />
              <stop offset="100%" stopColor="var(--color-primary-600, #b06a54)" />
            </linearGradient>
          </defs>
          {/* Background Track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            className="stroke-neutral-200/60 dark:stroke-neutral-800/60 fill-none"
            strokeWidth="2.5"
          />
          {/* Scroll Progress Fill */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="url(#progress-gradient)"
            className="fill-none transition-all duration-150 ease-out"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Arrows with Premium Slide-up Micro-animation */}
        <div className="relative size-5 overflow-hidden">
          <ArrowUpIcon
            className="absolute inset-0 size-full text-neutral-600 dark:text-neutral-300 transition-all duration-300 ease-out transform group-hover:-translate-y-6 group-hover:opacity-0"
            strokeWidth={2.5}
          />
          <ArrowUpIcon
            className="absolute inset-0 size-full text-primary-500 transition-all duration-300 ease-out transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            strokeWidth={2.5}
          />
        </div>
      </button>
    </div>
  )
}

export default ScrollToTop

