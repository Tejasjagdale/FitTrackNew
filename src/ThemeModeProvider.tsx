import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PaletteMode } from '@mui/material'
import getTheme from './theme'

type Mode = PaletteMode

interface ThemeModeContextType {
  mode: Mode
  toggleMode: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined)

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext)
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider')
  return ctx
}

const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const stored = localStorage.getItem('themeMode') as Mode | null
      return stored ?? 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode)
    } catch {}
  }, [mode])

  // reflect theme on the document body so CSS can adapt (light vs dark)
  useEffect(() => {
    try {
      if (mode === 'light') {
        document.body.classList.add('theme-light')
        document.body.classList.remove('theme-dark')
      } else {
        document.body.classList.add('theme-dark')
        document.body.classList.remove('theme-light')
      }
    } catch {}
  }, [mode])

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'))

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

export default ThemeModeProvider
