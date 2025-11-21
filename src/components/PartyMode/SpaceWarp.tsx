import React, { useEffect, useRef } from 'react'

export default function SpaceWarp() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Space warp variables
    const stars: Array<{ x: number; y: number; z: number; speed: number }> = []
    const numStars = 200
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
        speed: Math.random() * 2 + 1,
      })
    }

    let animationFrame: number

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw stars
      stars.forEach((star) => {
        // Move star towards viewer
        star.z -= star.speed

        // Reset star if it's too close
        if (star.z <= 0) {
          star.z = 1000
          star.x = (Math.random() - 0.5) * 2000
          star.y = (Math.random() - 0.5) * 2000
        }

        // Calculate 2D position
        const k = 128 / star.z
        const px = star.x * k + centerX
        const py = star.y * k + centerY

        // Draw star
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          const size = (1 - star.z / 1000) * 3
          const brightness = Math.min(255, (1 - star.z / 1000) * 255)
          ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 1)`
          ctx.beginPath()
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()

          // Draw trail
          const trailLength = 20
          const prevZ = star.z + star.speed * trailLength
          const prevK = 128 / prevZ
          const prevPx = star.x * prevK + centerX
          const prevPy = star.y * prevK + centerY

          ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.3)`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(prevPx, prevPy)
          ctx.lineTo(px, py)
          ctx.stroke()
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
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
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

