import React, { useEffect, useState } from 'react'
import { useColorMode } from '@docusaurus/theme-common'
import './styles.css'

type ThemeMode = 'light' | 'dark' | 'party'

export default function ThemeSwitcher() {
  const { colorMode, setColorMode } = useColorMode()
  const [currentMode, setCurrentMode] = useState<ThemeMode>('light')

  useEffect(() => {
    // Check if party mode is set in localStorage on mount
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null
    if (savedMode === 'party') {
      setCurrentMode('party')
      document.documentElement.setAttribute('data-theme', 'party')
      // Keep Docusaurus colorMode as dark for compatibility
      if (colorMode !== 'dark') {
        setColorMode('dark')
      }
    } else {
      setCurrentMode(colorMode as ThemeMode)
      document.documentElement.setAttribute('data-theme', colorMode)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'party']
    const currentIndex = modes.indexOf(currentMode)
    const nextIndex = (currentIndex + 1) % modes.length
    const nextMode = modes[nextIndex]

    setCurrentMode(nextMode)
    localStorage.setItem('theme-mode', nextMode)

    if (nextMode === 'party') {
      document.documentElement.setAttribute('data-theme', 'party')
      // Keep Docusaurus colorMode as dark for compatibility
      setColorMode('dark')
    } else {
      document.documentElement.setAttribute('data-theme', nextMode)
      setColorMode(nextMode)
    }
  }

  const getIcon = () => {
    switch (currentMode) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      case 'party':
        return '🎉'
      default:
        return '☀️'
    }
  }

  return (
    <button
      className="theme-switcher"
      onClick={cycleTheme}
      aria-label={`Switch theme. Current: ${currentMode}`}
      title={`Current: ${currentMode}. Click to cycle themes.`}
    >
      <span className="theme-switcher-icon">{getIcon()}</span>
    </button>
  )
}

