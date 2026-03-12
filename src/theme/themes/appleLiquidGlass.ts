import { createTheme } from "@mui/material/styles";

export const appleLiquidGlass = createTheme({
  palette: {
    mode: "dark",

    primary: { main: "#0A84FF" },
    secondary: { main: "#64D2FF" },

    background: {
      default: "#0f172a",

      /* glass base surface */
      paper: "rgba(255,255,255,0.06)"
    },

    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.7)"
    }
  },

  typography: {
    fontFamily: "Inter, sans-serif"
  },

  shape: {
    borderRadius: 16
  },

  components: {

    /* GLOBAL SURFACE STYLE */
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)"
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)"
        }
      }
    },

    /* PRIMARY BUTTON */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: "none",
          fontWeight: 600
        },

        contained: {
          backdropFilter: "blur(12px)",
          background: "rgba(10,132,255,0.8)",
          boxShadow: "0 6px 20px rgba(10,132,255,0.45)",

          "&:hover": {
            background: "rgba(10,132,255,0.95)",
            boxShadow: "0 8px 30px rgba(10,132,255,0.65)"
          }
        },

        outlined: {
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.04)"
        }
      }
    },

    /* GLASS DIALOG */
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: "blur(22px)",
          background: "rgba(30,41,59,0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)"
        }
      }
    },

    /* TEXTFIELDS */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.05)",

          "& fieldset": {
            borderColor: "rgba(255,255,255,0.15)"
          }
        }
      }
    }
  }
});