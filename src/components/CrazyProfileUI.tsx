import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

type User = "TJ" | "KU";

type Props = {
  chooseUser: (user: User) => void;
};

const borderFlow = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const users: { id: User; label: string }[] = [
  { id: "TJ", label: "TJ" },
  { id: "KU", label: "KU" },
];

const CrazyProfileUI: React.FC<Props> = ({ chooseUser }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 20% 20%, rgba(0,255,170,0.12), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,255,170,0.08), transparent 40%), #05070a",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 7,
          borderRadius: "28px",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(0,255,170,0.2)",
          background:
            "linear-gradient(160deg, rgba(0,255,170,0.08), rgba(0,0,0,0.7))",
        }}
      >
        <Stack spacing={6} alignItems="center">
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 26,
              letterSpacing: 3,
              textTransform: "uppercase",
              background:
                "linear-gradient(90deg,#00ffa6,#00ffd0,#00ffa6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Select Profile
          </Typography>

          <Stack direction="row" spacing={5}>
            {users.map((u, index) => (
              <Box
                key={u.id}
                onClick={() => chooseUser(u.id)}
                sx={{
                  position: "relative",
                  width: 220,
                  height: 160,
                  borderRadius: "18px",
                  cursor: "pointer",
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  background:
                    "linear-gradient(145deg, rgba(0,255,170,0.05), rgba(0,0,0,0.6))",
                  border: "1px solid rgba(0,255,170,0.18)",
                  transition: "all .35s ease",
                  animation: `${float} ${6 + index}s ease-in-out infinite`,

                  // animated neon edge
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: -1,
                    borderRadius: "20px",
                    padding: "1px",
                    background:
                      "linear-gradient(120deg, transparent, #00ffa6, transparent)",
                    backgroundSize: "200% 200%",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    opacity: 0,
                    animation: `${borderFlow} 4s linear infinite`,
                    transition: ".35s",
                  },

                  "&:hover::before": {
                    opacity: 1,
                  },

                  "&:hover": {
                    transform: "translateY(-10px) scale(1.04)",
                    border: "1px solid rgba(0,255,170,0.45)",
                    boxShadow:
                      "0 10px 40px rgba(0,255,170,0.25)",
                  },
                }}
              >
                {/* subtle glass badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    fontSize: 12,
                    px: 1.2,
                    py: 0.4,
                    borderRadius: "8px",
                    color: "#00ffd0",
                    border: "1px solid rgba(0,255,170,0.25)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  User {index + 1}
                </Box>

                <Typography
                  sx={{
                    fontSize: 14,
                    opacity: 0.55,
                    letterSpacing: 1,
                  }}
                >
                  Identity
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 28,
                    letterSpacing: 2,
                    mt: 0.5,
                    color: "#00ffd0",
                  }}
                >
                  {u.label}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    opacity: 0.5,
                    mt: 1,
                  }}
                >
                  Tap to continue
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CrazyProfileUI;