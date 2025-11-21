import React, { useEffect, useRef, useState } from 'react'

export default function Space3D() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)
  const [isPartyMode, setIsPartyMode] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    
    const checkPartyMode = () => {
      try {
        setIsPartyMode(document.documentElement.getAttribute('data-party-mode') === 'true')
      } catch (e) {
        console.error('Error checking party mode:', e)
      }
    }
    checkPartyMode()
    
    try {
      const observer = new MutationObserver(checkPartyMode)
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-party-mode'] })
      return () => observer.disconnect()
    } catch (e) {
      console.error('Error setting up party mode observer:', e)
    }
  }, [])

  if (!isPartyMode) return null

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleScroll = () => {
      try {
        setScrollY(window.scrollY)
      } catch (e) {
        console.error('Error handling scroll:', e)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="space-3d-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Particle System */}
      <ParticleSystem scrollY={scrollY} />
      
      {/* Scroll-triggered morphing shapes */}
      <MorphingShapes scrollY={scrollY} />
    </div>
  )
}

// Particle System Component
function ParticleSystem({ scrollY }: { scrollY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof window === 'undefined') return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isActive = true

    const resizeCanvas = () => {
      try {
        if (canvas && isActive) {
          canvas.width = window.innerWidth || 800
          canvas.height = window.innerHeight || 600
        }
      } catch (e) {
        console.error('Error resizing canvas:', e)
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas, { passive: true })

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    const numParticles = 30 // Reduced from 50 to prevent performance issues
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 300}, 70%, 60%)`,
      })
    }

    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    let animationFrame: number

    const animate = () => {
      if (!isActive || !canvas || !ctx) return
      
      try {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseX - particle.x
        const dy = mouseY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0.1 && distance < 100) {
          const force = Math.min(100 / distance, 0.1)
          particle.vx -= (dx / distance) * force
          particle.vy -= (dy / distance) * force
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Connect nearby particles (limit connections to prevent performance issues)
        particles.slice(i + 1).slice(0, 10).forEach((other) => {
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0.1 && distance < 100) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance / 100)})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        })
      })

        animationFrame = requestAnimationFrame(animate)
      } catch (e) {
        console.error('Error in particle animation:', e)
        isActive = false
      }
    }

    animate()

    return () => {
      isActive = false
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.6,
      }}
    />
  )
}

// Morphing Shapes Component
function MorphingShapes({ scrollY }: { scrollY: number }) {
  const shapesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shapesRef.current) return

    try {
      const progress = Math.min(scrollY / 1000, 1)
      const scale = 0.5 + progress * 0.5
      const rotation = progress * 360

      shapesRef.current.style.transform = `scale(${scale}) rotate(${rotation}deg)`
      shapesRef.current.style.opacity = `${0.3 + progress * 0.3}`
    } catch (e) {
      console.error('Error updating morphing shapes:', e)
    }
  }, [scrollY])

  return (
    <div
      ref={shapesRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        transition: 'transform 0.1s ease-out',
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        </defs>
        <circle
          cx="100"
          cy="100"
          r={50 + Math.sin(scrollY / 50) * 20}
          fill="rgba(255, 173, 173, 0.3)"
          filter="url(#blur)"
        />
        <circle
          cx="100"
          cy="100"
          r={40 + Math.cos(scrollY / 50) * 15}
          fill="rgba(202, 255, 191, 0.3)"
          filter="url(#blur)"
        />
      </svg>
    </div>
  )
}

