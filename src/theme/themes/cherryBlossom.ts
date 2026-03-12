import { createTheme } from "@mui/material/styles";

export const cherryBlossom = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#e85a8d"
    },

    secondary: {
      main: "#f3a9bb"
    },

    background: {
      default: "#fde7ee",
      paper: "rgba(255,255,255,0.75)"
    },

    text: {
      primary: "#5a3438",
      secondary: "#8a5a60"
    }
  },

  typography: {
    fontFamily: "Quicksand, sans-serif"
  },

  shape: {
    borderRadius: 18
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,

          background:
            "linear-gradient(135deg,#f7b6c9,#e85a8d)",

          color: "#fff",

          boxShadow:
            "0 6px 18px rgba(232,90,141,0.25)",

          textTransform: "none",

          "&:hover": {
            boxShadow:
              "0 10px 24px rgba(232,90,141,0.35)"
          }
        }
      }
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(14px)",

          background:
            "rgba(255,255,255,0.65)",

          border:
            "1px solid rgba(232,90,141,0.15)",

          boxShadow:
            "0 10px 25px rgba(232,90,141,0.15)"
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(14px)",
          background: "rgba(255,255,255,0.65)"
        }
      }
    }
  }
});