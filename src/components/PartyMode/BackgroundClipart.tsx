import React, { useEffect, useState } from 'react'
import './BackgroundClipart.css'

// Background gifs - organized into background, midground, and foreground layers
// Each gif used once except mew.webp (used twice: massive and small)
// All gifs are completely static (no floating/moving)
const backgroundClipart = [
  // BACKGROUND LAYER (z-index: 0) - Large gifs, very low opacity, don't scroll
  { 
    gif: '/party_gifs/mew.webp', 
    size: '65vw', 
    top: '50%', 
    left: '50%', 
    fixed: true, 
    opacity: 0.08, 
    zIndex: 0,
    transform: 'translate(-50%, -50%)' 
  },
  { 
    gif: '/party_gifs/i-49995.gif', 
    size: '35vw', 
    top: '15%', 
    left: '-5%', 
    fixed: true, 
    opacity: 0.12, 
    zIndex: 0 
  },
  { 
    gif: '/party_gifs/i-37830.gif', 
    size: '32vw', 
    top: '75%', 
    right: '-5%', 
    fixed: true, 
    opacity: 0.12, 
    zIndex: 0 
  },
  
  // MIDGROUND LAYER (z-index: 1) - Medium gifs, scroll with page
  { 
    gif: '/party_gifs/bird-0199.gif', 
    size: '20vw', 
    top: '8%', 
    left: '5%', 
    fixed: false, 
    opacity: 0.18, 
    zIndex: 1 
  },
  { 
    gif: '/party_gifs/bird-0333.gif', 
    size: '18vw', 
    top: '12%', 
    right: '5%', 
    fixed: false, 
    opacity: 0.18, 
    zIndex: 1 
  },
  { 
    gif: '/party_gifs/i-22899.gif', 
    size: '15vw', 
    top: '45%', 
    left: '3%', 
    fixed: false, 
    opacity: 0.16, 
    zIndex: 1 
  },
  { 
    gif: '/party_gifs/i-62901.gif', 
    size: '17vw', 
    top: '50%', 
    right: '3%', 
    fixed: false, 
    opacity: 0.16, 
    zIndex: 1 
  },
  { 
    gif: '/party_gifs/i-47893.gif', 
    size: '15vw', 
    top: '80%', 
    left: '10%', 
    fixed: false, 
    opacity: 0.16, 
    zIndex: 1 
  },
  { 
    gif: '/party_gifs/i-72752.gif', 
    size: '18vw', 
    top: '85%', 
    right: '8%', 
    fixed: false, 
    opacity: 0.18, 
    zIndex: 1 
  },
  
  // FOREGROUND LAYER (z-index: 2) - Small/medium gifs, don't scroll, higher opacity
  { 
    gif: '/party_gifs/i-77048.gif', 
    size: '12vw', 
    top: '22%', 
    left: '50%', 
    fixed: true, 
    opacity: 0.22, 
    zIndex: 2,
    transform: 'translateX(-50%)' 
  },
  { 
    gif: '/party_gifs/sparkles4.gif', 
    size: '16vw', 
    bottom: '28%', 
    left: '50%', 
    fixed: true, 
    opacity: 0.22, 
    zIndex: 2,
    transform: 'translateX(-50%)' 
  },
  { 
    gif: '/party_gifs/mew.webp', 
    size: '10vw', 
    top: '72%', 
    left: '38%', 
    fixed: true, 
    opacity: 0.25, 
    zIndex: 2 
  },
]

export default function BackgroundClipart() {
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

  return (
    <div className="party-clipart-bg">
      {backgroundClipart.map((item, index) => (
        <img
          key={index}
          src={item.gif}
          alt="Party background gif"
          className="party-bg-clipart"
          loading="lazy"
          onError={(e) => {
            // Hide broken images to prevent layout issues
            e.currentTarget.style.display = 'none'
          }}
          style={{
            position: item.fixed ? 'fixed' : 'absolute',
            top: item.top || undefined,
            bottom: item.bottom || undefined,
            left: item.left || undefined,
            right: item.right || undefined,
            width: item.size,
            height: item.size,
            maxWidth: '90vw',
            maxHeight: '90vh',
            minWidth: '50px',
            minHeight: '50px',
            objectFit: 'contain',
            opacity: item.opacity,
            pointerEvents: 'none',
            zIndex: item.zIndex !== undefined ? item.zIndex : 0,
            transform: item.transform || 'none',
          }}
        />
      ))}
    </div>
  )
}

