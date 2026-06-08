'use client'

import React, { useEffect, useState } from 'react'

interface PageLoaderProps {
  isVisible: boolean
}

const PageLoader: React.FC<PageLoaderProps> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [opacityClass, setOpacityClass] = useState('opacity-0')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isVisible) {
      setShouldRender(true)
      setProgress(0)
      
      // Delay opacity transition slightly to trigger CSS transition on mount
      const fadeTimeout = setTimeout(() => {
        setOpacityClass('opacity-100')
      }, 20)

      // Animate progress up to 90%
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 50) return prev + 4 // quick start
          if (prev < 80) return prev + 2
          if (prev < 90) return prev + 0.8 // slow down towards 90%
          return prev
        })
      }, 40)

      return () => {
        clearTimeout(fadeTimeout)
        clearInterval(interval)
      }
    } else {
      // When isVisible goes false, accelerate progress to 100% extremely fast
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 100) {
            const next = prev + 20
            return next > 100 ? 100 : next
          }
          return 100
        })
      }, 10)

      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Fade out and unmount when progress is 100% and isVisible is false
  useEffect(() => {
    if (progress === 100 && !isVisible) {
      const fadeOutTimeout = setTimeout(() => {
        setOpacityClass('opacity-0')
        const unmountTimeout = setTimeout(() => {
          setShouldRender(false)
        }, 250) // matches transition duration
        return () => clearTimeout(unmountTimeout)
      }, 30) // minor hold for final ring completion render
      return () => clearTimeout(fadeOutTimeout)
    }
  }, [progress, isVisible])

  if (!shouldRender) return null

  // SVG progress path details:
  // Circumference of R=50 is 2 * Math.PI * 50 = 314.159
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Progress-driven wrapping thread length (approx 120px)
  const wrappingCircumference = 120
  const wrappingDashoffset = wrappingCircumference - (progress / 100) * wrappingCircumference

  // Detect completion to trigger target transitions
  const isComplete = progress === 100 && !isVisible

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F7F3EE] transition-opacity duration-250 ease-in-out ${opacityClass} ${
        !isVisible ? 'pointer-events-none' : ''
      }`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes yarn-bounce {
          0% {
            transform: translateY(0) scaleY(0.85) scaleX(1.15);
            animation-timing-function: ease-out;
          }
          12% {
            transform: translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-out;
          }
          50% {
            transform: translateY(-26px) scaleY(1) scaleX(1);
            animation-timing-function: ease-in;
          }
          88% {
            transform: translateY(0) scaleY(1.05) scaleX(0.95);
            animation-timing-function: ease-in;
          }
          94% {
            transform: translateY(0) scaleY(0.85) scaleX(1.15);
            animation-timing-function: ease-out;
          }
          100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
        }
        @keyframes needle-left-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-5deg); }
          90% { transform: rotate(4deg); }
        }
        @keyframes needle-right-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
          90% { transform: rotate(-4deg); }
        }
        @keyframes sparkle-show {
          0%, 82%, 100% { opacity: 0; transform: scale(0.3); }
          90% { opacity: 1; transform: scale(1.1); }
          95% { opacity: 0.2; transform: scale(1); }
        }
        .animate-yarn-bounce {
          animation: yarn-bounce 1.4s infinite;
        }
        .animate-needle-left {
          animation: needle-left-sway 1.4s infinite;
        }
        .animate-needle-right {
          animation: needle-right-sway 1.4s infinite;
        }
        .animate-sparkle {
          animation: sparkle-show 1.4s infinite;
        }
      `}} />

      {/* Composition Wrapper moved upward by 6% with subtle scale/fade transition on completion */}
      <div
        className={`relative flex flex-col items-center justify-center -translate-y-[6%] transition-all duration-300 ease-in-out ${
          isComplete ? 'opacity-0 scale-95 blur-[2px]' : 'opacity-100 scale-100 blur-0'
        }`}
      >
        {/* Crochet Yarn Ball Loading Graphic */}
        <div className="relative w-44 h-44 select-none flex items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="overflow-visible"
          >
            {/* 1. Circular Progress Path (Thread) */}
            {/* Faint track background (disappears when complete) */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#6E5648"
              strokeWidth="1.1"
              strokeOpacity="0.08"
              fill="none"
              className={`transition-opacity duration-300 ${isComplete ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Glowing progress trace (disappears when complete) */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#E8C2CA"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`fill-none transition-all duration-300 ease-out ${
                isComplete ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* 2. Sparkle Impact Lines (stationary, outside the bounce group) */}
            <g className="animate-sparkle" style={{ transformOrigin: '60px 28px', stroke: '#6E5648', strokeWidth: '2.2', strokeLinecap: 'round' }}>
              <path d="M 60 27 L 60 20" />
              <path d="M 52 30 L 46 25" />
              <path d="M 68 30 L 74 25" />
            </g>

            {/* 3. Bouncing Yarn Ball & Needles group */}
            <g className="animate-yarn-bounce" style={{ transformOrigin: '60px 86px' }}>
              
              {/* Crossed Knitting Needles (drawn behind the ball body) */}
              <g>
                {/* Left Needle (shaft & head) */}
                <g className="animate-needle-left" style={{ transformOrigin: '27px 29px' }}>
                  <line x1="27" y1="29" x2="93" y2="95" stroke="#6E5648" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="27" cy="29" r="4.5" fill="#F7F3EE" stroke="#6E5648" strokeWidth="2.2" />
                </g>
                
                {/* Right Needle (shaft & head) */}
                <g className="animate-needle-right" style={{ transformOrigin: '93px 29px' }}>
                  <line x1="93" y1="29" x2="27" y2="95" stroke="#6E5648" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="93" cy="29" r="4.5" fill="#F7F3EE" stroke="#6E5648" strokeWidth="2.2" />
                </g>
              </g>

              {/* Yarn Ball Body (circular contour with solid fill to hide needle intersection) */}
              <circle cx="60" cy="62" r="23" fill="#E8C2CA" stroke="#6E5648" strokeWidth="2.5" />

              {/* Decorative Loops / Arcs (representing the wound strands) */}
              <g stroke="#6E5648" strokeWidth="2.2" strokeLinecap="round" fill="none">
                {/* Slanted loops (from top-left towards bottom-right) */}
                <path d="M 46 45 C 50 49, 68 67, 75 69" />
                <path d="M 52 40 C 58 46, 72 60, 77 58" opacity="0.85" />
                
                {/* Horizontal loops on the right side */}
                <path d="M 68 47 C 75 49, 81 55, 81 63" />
                <path d="M 62 55 C 69 57, 77 63, 75 70" opacity="0.85" />
                <path d="M 58 62 C 64 64, 69 69, 69 75" opacity="0.75" />
                
                {/* Short curves at the bottom left */}
                <path d="M 45 68 C 43 72, 40 76, 38 76" />
                <path d="M 50 65 C 48 70, 45 75, 43 76" />
                <path d="M 55 63 C 53 69, 50 74, 48 75" />
                <path d="M 60 63 C 58 69, 55 74, 53 75" />
              </g>

              {/* Progress-driven winding thread (drawn in front, visually fills as progress increases) */}
              <path
                d="M 46 45 C 55 38, 72 52, 60 66 C 48 80, 68 88, 77 80"
                stroke="#F7F3EE"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray={wrappingCircumference}
                strokeDashoffset={wrappingDashoffset}
                className="transition-all duration-150 ease-out"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Typography */}
        <div className="mt-8 flex flex-col items-center text-center px-4">
          <h1
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            className="text-[26px] md:text-3xl font-normal text-[#6E5648] tracking-[0.06em] leading-tight select-none"
          >
            Thread and Crochet
          </h1>
          <p
            style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
            className="text-[10px] md:text-[11px] font-light text-[#6E5648]/75 tracking-[0.18em] mt-2.5 uppercase select-none"
          >
            Loading handmade beauty...
          </p>
        </div>
      </div>
    </div>
  )
}

export default PageLoader


