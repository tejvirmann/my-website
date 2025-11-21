// Client module to inject party mode theme switcher
export function onRouteDidUpdate() {
  // Wait for navbar to be ready
  setTimeout(() => {
    const navbarItems = document.querySelector('.navbar__items--right')
    if (!navbarItems) return

    // Check if theme switcher already exists
    if (navbarItems.querySelector('.party-theme-switcher')) return

    // Create theme switcher button
    const button = document.createElement('button')
    button.className = 'party-theme-switcher navbar__item'
    button.setAttribute('aria-label', 'Switch theme')
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
    `

    // Get current theme
    const getCurrentTheme = () => {
      const saved = localStorage.getItem('theme-mode')
      if (saved === 'party') return 'party'
      return document.documentElement.getAttribute('data-theme') || 'light'
    }

    // Update icon based on theme
    const updateIcon = () => {
      const theme = getCurrentTheme()
      button.innerHTML = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🎉'
    }

    // Cycle themes
    button.onclick = () => {
      const modes = ['light', 'dark', 'party']
      const current = getCurrentTheme()
      const nextIndex = (modes.indexOf(current) + 1) % modes.length
      const next = modes[nextIndex]

      localStorage.setItem('theme-mode', next)
      document.documentElement.setAttribute('data-theme', next)

      // If party mode, set random party color
      if (next === 'party') {
        const partyColors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff']
        const randomColor = partyColors[Math.floor(Math.random() * partyColors.length)]
        document.documentElement.style.setProperty('--party-current-color', randomColor)
        localStorage.setItem('party-color', randomColor)
      } else {
        // Remove party color when switching away
        document.documentElement.style.removeProperty('--party-current-color')
      }

      // Update Docusaurus colorMode if not party
      if (next !== 'party') {
        // Try to trigger Docusaurus theme change
        const colorModeToggle = document.querySelector('.navbar__item [class*="colorModeToggle"]')
        if (colorModeToggle && next === 'dark') {
          colorModeToggle.click()
        }
      }

      updateIcon()

      // Apply party mode styles when switching
      if (next === 'party') {
        setTimeout(() => {
          applyPartyModeStyles()
        }, 100)
      }
    }

    // Apply party mode styles function
    const applyPartyModeStyles = () => {
      if (getCurrentTheme() === 'party') {
        // Show logo in navbar
        const logo = document.querySelector('.navbar__logo')
        if (logo) {
          logo.style.display = 'block'
          logo.style.opacity = '1'
          logo.style.visibility = 'visible'
        }
        // Remove any distortion effects on navbar text
        const navbarItems = document.querySelectorAll('.navbar__item, .navbar__link, .navbar__brand')
        navbarItems.forEach(item => {
          item.style.filter = 'none'
          item.style.transform = 'none'
          item.style.textShadow = 'none'
          item.style.animation = 'none'
        })
      }
    }

    // Load saved party color on mount
    if (getCurrentTheme() === 'party') {
      const savedColor = localStorage.getItem('party-color')
      if (savedColor) {
        document.documentElement.style.setProperty('--party-current-color', savedColor)
      } else {
        const partyColors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff']
        const randomColor = partyColors[Math.floor(Math.random() * partyColors.length)]
        document.documentElement.style.setProperty('--party-current-color', randomColor)
        localStorage.setItem('party-color', randomColor)
      }
    }

    // Apply styles after a short delay to ensure DOM is ready
    setTimeout(applyPartyModeStyles, 200)

    updateIcon()
    navbarItems.appendChild(button)
  }, 100)
}
