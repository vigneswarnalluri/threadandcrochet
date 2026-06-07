'use client'

import React, { useEffect, useState } from 'react'

interface PageLoaderProps {
  isVisible: boolean
}

const PageLoader: React.FC<PageLoaderProps> = ({ isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [opacityClass, setOpacityClass] = useState('opacity-0')

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Small timeout to allow element to mount before animating opacity
      const timeout = setTimeout(() => {
        setOpacityClass('opacity-100')
      }, 20)
      return () => clearTimeout(timeout)
    } else {
      setOpacityClass('opacity-0')
      // Wait for transition duration (300ms) to complete before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [isVisible])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-max flex flex-col items-center justify-center bg-[#FAF6F1] transition-opacity duration-300 ease-in-out ${opacityClass}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes yarn-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hook-wiggle {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-4px, 4px) rotate(-15deg); }
        }
        @keyframes stroke-draw {
          0% { stroke-dasharray: 1 300; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 120 300; stroke-dashoffset: -40; }
          100% { stroke-dasharray: 1 300; stroke-dashoffset: -264; }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-yarn-bounce {
          animation: yarn-bounce 2s ease-in-out infinite;
        }
        .animate-hook-wiggle {
          animation: hook-wiggle 2s ease-in-out infinite;
        }
        .animate-stroke-draw {
          animation: stroke-draw 2.5s ease-in-out infinite;
        }
      `}} />

      <div className="relative flex flex-col items-center">
        {/* Crochet Yarn Ball Loading Graphic */}
        <div className="relative size-32 select-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Circular Loader Path representing running thread */}
            <circle
              cx="50"
              cy="50"
              r="43"
              stroke="#D8A7B1"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-stroke-draw"
            />
            
            {/* Inner Yarn Ball */}
            <g className="animate-yarn-bounce" style={{ transformOrigin: '50% 50%' }}>
              {/* Ball backing shadow */}
              <circle cx="50" cy="50" r="28" fill="#D8A7B1" opacity="0.15" />
              {/* Ball border */}
              <circle cx="50" cy="50" r="28" stroke="#6B4E3D" strokeWidth="2.5" />
              
              {/* Weaving thread loops */}
              <path d="M30 40 C 40 25, 60 25, 70 40" stroke="#6B4E3D" strokeWidth="1.8" />
              <path d="M25 50 C 35 32, 65 32, 75 50" stroke="#6B4E3D" strokeWidth="1.8" />
              <path d="M30 60 C 40 75, 60 75, 70 60" stroke="#6B4E3D" strokeWidth="1.8" />
              <path d="M40 30 C 25 40, 25 60, 40 70" stroke="#6B4E3D" strokeWidth="1.8" />
              <path d="M50 24 C 34 34, 34 66, 50 76" stroke="#6B4E3D" strokeWidth="1.8" />
              <path d="M60 30 C 75 40, 75 60, 60 70" stroke="#6B4E3D" strokeWidth="1.8" />
            </g>

            {/* Crochet Hook detail wiggling */}
            <g className="animate-hook-wiggle" style={{ transformOrigin: '68% 40%' }}>
              {/* Hook shaft */}
              <path d="M78 22 L56 54" stroke="#6B4E3D" strokeWidth="3" strokeLinecap="round" />
              {/* Hook head */}
              <path
                d="M56 54 C 54.5 56, 52.5 54.5, 53.5 52.5 C 54.5 50.5, 57 52.5, 55.5 54.5"
                stroke="#6B4E3D"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>

        {/* Brand/Loading text */}
        <div className="mt-8 flex flex-col items-center text-center">
          <p className="font-sans text-lg font-medium tracking-widest text-[#6B4E3D] uppercase select-none animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </div>
  )
}

export default PageLoader
