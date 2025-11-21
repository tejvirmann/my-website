// Client module to inject space warp effect into footer in party mode
export function onRouteDidUpdate() {
  const checkAndInject = () => {
    try {
      const footer = document.querySelector('footer')
      if (!footer) return

      // Check if already injected
      if (footer.querySelector('.space-warp-canvas')) return

      // Check if party mode
      const isPartyMode = document.documentElement.getAttribute('data-party-mode') === 'true'
      if (!isPartyMode) {
        // Remove canvas if party mode is off
        const existingCanvas = footer.querySelector('.space-warp-canvas')
        if (existingCanvas) {
          existingCanvas.remove()
        }
        return
      }

    // Create canvas for space warp
    const canvas = document.createElement('canvas')
    canvas.className = 'space-warp-canvas'
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `

    footer.style.position = 'relative'
    footer.appendChild(canvas)

    // Space warp animation
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      canvas.remove()
      return
    }

    const resizeCanvas = () => {
      try {
        if (footer && canvas) {
          canvas.width = footer.offsetWidth || 800
          canvas.height = footer.offsetHeight || 400
        }
      } catch (e) {
        console.error('Error resizing canvas:', e)
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Stars
    const stars = []
    const numStars = 200
    let centerX = canvas.width / 2
    let centerY = canvas.height / 2

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000,
        speed: Math.random() * 2 + 1,
      })
    }

    let animationFrame
    let isAnimating = true

    const animate = () => {
      if (!isAnimating || !canvas || !ctx) return
      
      try {
        // Update center on each frame in case canvas resized
        centerX = canvas.width / 2
        centerY = canvas.height / 2
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        stars.forEach((star) => {
          star.z -= star.speed

          if (star.z <= 0) {
            star.z = 1000
            star.x = (Math.random() - 0.5) * 2000
            star.y = (Math.random() - 0.5) * 2000
          }

          const k = 128 / star.z
          const px = star.x * k + centerX
          const py = star.y * k + centerY

          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const size = Math.max(0.5, (1 - star.z / 1000) * 3)
            const brightness = Math.min(255, Math.max(0, (1 - star.z / 1000) * 255))
            ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 1)`
            ctx.beginPath()
            ctx.arc(px, py, size, 0, Math.PI * 2)
            ctx.fill()

            // Trail
            const trailLength = 20
            const prevZ = star.z + star.speed * trailLength
            if (prevZ > 0) {
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
          }
        })

        animationFrame = requestAnimationFrame(animate)
      } catch (e) {
        console.error('Error in space warp animation:', e)
        isAnimating = false
      }
    }

    animate()

    // Cleanup on theme change
    const observer = new MutationObserver(() => {
      const isParty = document.documentElement.getAttribute('data-party-mode') === 'true'
      if (!isParty && canvas && canvas.parentNode) {
        isAnimating = false
        cancelAnimationFrame(animationFrame)
        window.removeEventListener('resize', resizeCanvas)
        canvas.remove()
        observer.disconnect()
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-party-mode'] })
    } catch (e) {
      console.error('Error setting up space warp:', e)
    }
  }

  setTimeout(checkAndInject, 100)
  // Also check when party mode changes
  const observer = new MutationObserver(checkAndInject)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-party-mode'] })
}

