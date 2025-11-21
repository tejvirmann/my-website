import React, { useEffect, useRef } from 'react'

interface TextGlitchProps {
  text: string
  className?: string
}

export default function TextGlitch({ text, className = '' }: TextGlitchProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseEnter = () => {
      container.style.animation = 'glitch 0.3s infinite'
    }

    const handleMouseLeave = () => {
      container.style.animation = 'none'
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      <style>{`
        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
            text-shadow: 0 0 0;
          }
          20% {
            transform: translate(-2px, 2px);
            text-shadow: -2px 2px 0 #ff0000, 2px -2px 0 #00ff00;
          }
          40% {
            transform: translate(-2px, -2px);
            text-shadow: 2px 2px 0 #ff0000, -2px -2px 0 #00ff00;
          }
          60% {
            transform: translate(2px, 2px);
            text-shadow: 2px -2px 0 #ff0000, -2px 2px 0 #00ff00;
          }
          80% {
            transform: translate(2px, -2px);
            text-shadow: -2px -2px 0 #ff0000, 2px 2px 0 #00ff00;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        className={className}
        style={{
          display: 'inline-block',
          cursor: 'pointer',
        }}
      >
        {text}
      </div>
    </>
  )
}

