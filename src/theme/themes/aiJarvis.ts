import { createTheme } from "@mui/material/styles";

export const aiJarvis = createTheme({
  palette: {
    mode: "dark",

    primary: { main: "#00e5ff" },
    secondary: { main: "#22c55e" },

    background: {
      default: "#020617",

      /* holographic glass surface */
      paper: "rgba(6, 24, 38, 0.85)"
    },

    text: {
      primary: "#b6faff",
      secondary: "rgba(182,250,255,0.7)"
    },

    divider: "rgba(0,229,255,0.18)"
  },

  typography: {
    fontFamily: "Orbitron, sans-serif"
  },

  shape: {
    borderRadius: 14
  },

  components: {

    /* GLOBAL GLASS SURFACE */
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(16px)",
          background: "rgba(6,24,38,0.85)",
          border: "1px solid rgba(0,229,255,0.18)",
          boxShadow: "0 0 30px rgba(0,229,255,0.12)"
        }
      }
    },

    /* HUD CARDS */
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(16px)",
          background: "rgba(6,24,38,0.8)",
          border: "1px solid rgba(0,229,255,0.25)",
          boxShadow: "0 0 18px rgba(0,229,255,0.2)"
        }
      }
    },

    /* PRIMARY BUTTON */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600
        },

        contained: {
          background: "rgba(0,229,255,0.18)",
          border: "1px solid rgba(0,229,255,0.5)",
          color: "#b6faff",

          boxShadow: "0 0 14px rgba(0,229,255,0.35)",

          "&:hover": {
            background: "rgba(0,229,255,0.25)",
            boxShadow: "0 0 22px rgba(0,229,255,0.6)"
          }
        },

        outlined: {
          border: "1px solid rgba(0,229,255,0.35)",
          color: "#b6faff",

          "&:hover": {
            background: "rgba(0,229,255,0.12)"
          }
        }
      }
    },

    /* DIALOG = AI TERMINAL PANEL */
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: "blur(20px)",
          background: "rgba(4,20,32,0.92)",
          border: "1px solid rgba(0,229,255,0.25)",
          boxShadow: "0 0 50px rgba(0,229,255,0.18)"
        }
      }
    },

    /* TEXTFIELDS */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(12px)",
          background: "rgba(0,229,255,0.05)",

          "& fieldset": {
            borderColor: "rgba(0,229,255,0.3)"
          },

          "&:hover fieldset": {
            borderColor: "rgba(0,229,255,0.6)"
          }
        }
      }
    },

    /* CHIP = HUD LABEL */
    MuiChip: {
      styleOverrides: {
        root: {
          background: "rgba(0,229,255,0.12)",
          border: "1px solid rgba(0,229,255,0.35)",
          color: "#b6faff"
        }
      }
    },

    /* DIVIDER */
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "rgba(0,229,255,0.15)"
        }
      }
    }
  }
});