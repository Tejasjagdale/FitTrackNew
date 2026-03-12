import { createContext, useContext, useState, useEffect } from "react"
import { ThemeProvider } from "@mui/material/styles"
import { themes, ThemeKey } from "./themeRegistry"
import ThemeBackground from "./ThemeBackground"

type ThemeContextType = {
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "apple",
  setTheme: () => {}
})

export const useAppTheme = () => useContext(ThemeContext)

interface ProviderProps {
  children: React.ReactNode
  initialTheme?: ThemeKey
}

export function AppThemeProvider({ children, initialTheme }: ProviderProps) {

  const [theme, setTheme] = useState<ThemeKey>(initialTheme ?? "apple")

  /* sync if parent changes theme (ex: profile loaded from github) */
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme)
    }
  }, [initialTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themes[theme]}>
        <ThemeBackground theme={theme} />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}