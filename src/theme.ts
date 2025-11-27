import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

const green = {
  50: '#e8f7ea',
  100: '#c8eed0',
  200: '#a3e3b0',
  300: '#7fd98f',
  400: '#5fd476',
  500: '#39cc53',
  600: '#2fb648',
  700: '#238f36',
  800: '#196b26',
  900: '#0d3b12'
}

const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#00c853',
        light: green[300],
        dark: green[700]
      },
      secondary: {
        main: '#00e676'
      },
      background: {
        default: mode === 'dark' ? '#04110b' : '#f6fff7',
        paper: mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff'
      },
      text: {
        primary: mode === 'dark' ? '#e6fff0' : '#042018'
      }
    },
    shape: {
      borderRadius: 16
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: mode === 'light' ? {
            background: 'linear-gradient(135deg, #f6fff7 0%, #e8f5f0 50%, #dff9f5 100%)',
            minHeight: '100vh'
          } : undefined
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12
          }
        }
      }
    },
    typography: {
      fontFamily: "Poppins, Inter, Roboto, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 }
    }
  })

export default getTheme
