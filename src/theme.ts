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
      // -----------------------------------------------------
      // GLOBAL BASELINE
      // -----------------------------------------------------
      MuiCssBaseline: {
        styleOverrides: {
          body:
            mode === 'light'
              ? {
                  background:
                    'linear-gradient(135deg, #f6fff7 0%, #e8f5f0 50%, #dff9f5 100%)',
                  minHeight: '100vh'
                }
              : undefined
        }
      },

      // -----------------------------------------------------
      // BUTTONS
      // -----------------------------------------------------
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 12
          }
        }
      },

      // -----------------------------------------------------
      // INPUT / SELECT / TEXTFIELD FIXES
      // -----------------------------------------------------
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.25)' : undefined
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255,255,255,0.4)' : undefined
            }
          },
          input: {
            color: mode === 'dark' ? '#e6fff0' : undefined
          }
        }
      },

      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            color: mode === 'dark' ? '#e6fff0' : undefined
          }
        }
      },

      // -----------------------------------------------------
      // MENU (SELECT DROPDOWN) — REMOVE GLASS
      // -----------------------------------------------------
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            color: mode === 'dark' ? '#e6fff0' : '#042018',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            '&::before, &::after': { display: 'none' }
          }
        }
      },

      MuiMenuItem: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            color: mode === 'dark' ? '#e6fff0' : '#042018',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#e0ffe8'
            },
            '&.Mui-selected:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.18)' : '#d4ffe0'
            }
          }
        }
      },

      // -----------------------------------------------------
      // AUTOCOMPLETE POPUP — REMOVE GLASS
      // -----------------------------------------------------
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            color: mode === 'dark' ? '#e6fff0' : '#042018',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            '&::before, &::after': { display: 'none' }
          },
          listbox: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            color: mode === 'dark' ? '#e6fff0' : '#042018'
          }
        }
      },

      // -----------------------------------------------------
      // POPOVER — REMOVE GLASS (Needed for menus)
      // -----------------------------------------------------
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'dark' ? '#0f0f0f' : '#ffffff',
            color: mode === 'dark' ? '#e6fff0' : '#042018',
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            '&::before, &::after': { display: 'none' }
          }
        }
      },

      // -----------------------------------------------------
      // GLASSMORPHISM FOR PAPER/CARD (BUT NOT MENUS)
      // -----------------------------------------------------
      MuiPaper: {
        styleOverrides: {
          root: {
            background:
              mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(255,255,255,0.20)',
            backdropFilter: 'blur(11px)',
            WebkitBackdropFilter: 'blur(11px)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.5),
              inset 0 -1px 0 rgba(255,255,255,0.1),
              inset 0 0 30px 15px rgba(255,255,255,0.15)
            `,
            position: 'relative',
            overflow: 'hidden',

            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)'
            },

            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1px',
              height: '100%',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.8), transparent, rgba(255,255,255,0.3))'
            }
          }
        }
      }
    },

    typography: {
      fontFamily:
        "Poppins, Inter, Roboto, -apple-system, 'Segoe UI', 'Helvetica Neue', Arial",
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 }
    }
  })

export default getTheme
