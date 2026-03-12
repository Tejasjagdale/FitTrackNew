import { createTheme } from "@mui/material/styles";

export const pokemon = createTheme({
  palette: {
    mode: "light",

    primary: { main: "#ef5350" },
    secondary: { main: "#ffca28" },

    background: {
      default: "#e8f5e9",
      paper: "#ffffff",
    },
  },

  typography: {
    fontFamily: `"Fredoka", "Nunito", sans-serif`,
    button: { fontWeight: 700 },
  },

  shape: {
    borderRadius: 20,
  },

  components: {
    /* GLOBAL CARD STYLE */
    MuiCard: {
      styleOverrides: {
        root: {
          border: "4px solid black",
          borderRadius: "20px",
          boxShadow: "8px 8px 0 black",
          overflow: "hidden",
          background: "#fff",
          position: "relative",

          transition: "transform 0.15s ease",

          "&:hover": {
            transform: "translate(-2px,-2px)",
            boxShadow: "10px 10px 0 black",
          },
        },
      },
    },

    /* HEADER SECTION INSIDE CARD */
    MuiCardHeader: {
      styleOverrides: {
        root: {
          background: "#ef5350",
          borderBottom: "4px solid black",
          padding: "10px 16px",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "3px solid black",
            background: "white",
            top: 12,
            right: 12,
          },
        },

        title: {
          fontWeight: 700,
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "16px",
        },
      },
    },

    MuiCardActions: {
      styleOverrides: {
        root: {
          borderTop: "3px solid black",
          padding: "8px 12px",
        },
      },
    },

    /* BUTTON STYLE */
    MuiButton: {
      styleOverrides: {
        root: {
          border: "3px solid black",
          borderRadius: 30,
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "4px 4px 0 black",

          "&:hover": {
            transform: "translate(-2px,-2px)",
            boxShadow: "6px 6px 0 black",
          },
        },
      },
    },

    /* CHIP = pokemon type badge */
    MuiChip: {
      styleOverrides: {
        root: {
          border: "2px solid black",
          fontWeight: 700,
          background: "#ffca28",
        },
      },
    },
  },
});
