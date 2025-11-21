// Client module to inject party mode button (separate from light/dark toggle)
export function onRouteDidUpdate() {
  // Wait for navbar to be ready
  setTimeout(() => {
    const navbarItems = document.querySelector('.navbar__items--right')
    if (!navbarItems) return

    // Check if party button already exists
    if (navbarItems.querySelector('.party-mode-button')) return

    // Check if party mode is active
    const isPartyMode = () => {
      return localStorage.getItem('party-mode') === 'true'
    }

    // Toggle party mode
    const togglePartyMode = () => {
      const active = isPartyMode()
      localStorage.setItem('party-mode', (!active).toString())
      applyPartyMode(!active)
    }

    // Helper to determine if color is light (needs black text) or dark (needs white text)
    const isLightColor = hex => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5 // Light colors need black text
    }

    // Apply party mode effects
    const applyPartyMode = enable => {
      if (enable) {
        // Set random party color - change each time party mode is enabled
        const partyColors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff']
        // Pick a random color each time (not from saved)
        const color = partyColors[Math.floor(Math.random() * partyColors.length)]
        document.documentElement.style.setProperty('--party-current-color', color)
        localStorage.setItem('party-color', color)
        document.documentElement.setAttribute('data-party-mode', 'true')

        // Set text color class based on color brightness
        if (isLightColor(color)) {
          document.documentElement.setAttribute('data-party-text', 'dark')
        } else {
          document.documentElement.setAttribute('data-party-text', 'light')
        }
      } else {
        document.documentElement.style.removeProperty('--party-current-color')
        document.documentElement.removeAttribute('data-party-mode')
        document.documentElement.removeAttribute('data-party-text')
      }
      updateButton()
    }

    // Update button appearance
    const updateButton = () => {
      const active = isPartyMode()
      button.style.opacity = active ? '1' : '0.7'
      button.style.transform = active ? 'scale(1.1)' : 'scale(1)'
      button.setAttribute('aria-label', active ? 'Disable party mode' : 'Enable party mode')
    }

    // Create party mode button
    const button = document.createElement('button')
    button.className = 'party-mode-button navbar__item'
    button.setAttribute('aria-label', 'Toggle party mode')
    button.innerHTML = '🎉'
    button.style.cssText = `
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      font-size: 1.25rem;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    `

    button.onclick = togglePartyMode

    // Add button to navbar
    navbarItems.appendChild(button)

    // Load saved party mode state
    if (isPartyMode()) {
      const savedColor = localStorage.getItem('party-color')
      if (savedColor) {
        document.documentElement.style.setProperty('--party-current-color', savedColor)
        // Set text color based on saved color (using same logic as applyPartyMode)
        if (isLightColor(savedColor)) {
          document.documentElement.setAttribute('data-party-text', 'dark')
        } else {
          document.documentElement.setAttribute('data-party-text', 'light')
        }
      }
      applyPartyMode(true)
    } else {
      updateButton()
    }
  }, 100)
}
