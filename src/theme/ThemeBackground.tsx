import { Box } from "@mui/material"
import { ThemeKey } from "./themeRegistry"

interface Props {
  theme: ThemeKey
}

export default function ThemeBackground({ theme }: Props) {

  if (theme === "jarvis") {
    const particles = Array.from({ length: 40 });
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 50%, #07121a 0%, #020617 60%, #000 100%)"
        }}
      >

        {/* ambient glow */}
        <Box
          sx={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(0,255,255,0.08)",
            filter: "blur(120px)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            animation: "pulse 10s ease-in-out infinite"
          }}
        />

        {/* floating particles */}
        {particles.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 2,
              height: 2,
              background: "#00e5ff",
              borderRadius: "50%",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.5,
              animation: `float ${10 + Math.random() * 15}s linear infinite`
            }}
          />
        ))}

        <style>
          {`
        @keyframes pulse {
          0% { opacity:0.3; transform:translate(-50%,-50%) scale(1);}
          50% { opacity:0.6; transform:translate(-50%,-50%) scale(1.1);}
          100% { opacity:0.3; transform:translate(-50%,-50%) scale(1);}
        }

        @keyframes float {
          0% { transform: translateY(0px);}
          100% { transform: translateY(-200px);}
        }
        `}
        </style>

      </Box>
    )
  }

  if (theme === "pokemon") {
    const balls = Array.from({ length: 12 });
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          background:
            "linear-gradient(#a5e3a1 0%, #74c365 50%, #4caf50 100%)"
        }}
      >
        {balls.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 26,
              height: 26,
              borderRadius: "50%",
              background:
                "linear-gradient(#ff3b3b 50%, white 50%)",
              border: "2px solid black",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 10}s linear infinite`
            }}
          />
        ))}

        <style>
          {`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-200px); }
        }
        `}
        </style>
      </Box>
    )
  }

  if (theme === "cherry") {
    const petals = Array.from({ length: 40 });

    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#fde7ee 0%,#fbd6e2 100%)"
        }}
      >
        {petals.map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",

              top: "-10%",
              left: `${Math.random() * 100}%`,

              width: `${8 + Math.random() * 10}px`,
              height: `${8 + Math.random() * 10}px`,

              borderRadius: "50% 50% 50% 0",

              background: "#f59bb2",

              opacity: 0.7 + Math.random() * 0.3,

              transform: "rotate(45deg)",

              animation: `petalFall ${5 + Math.random() * 5
                }s linear infinite`
            }}
          />
        ))}

        <style>
          {`
        @keyframes petalFall {

          0% {
            transform:
              translateY(-10vh)
              translateX(0px)
              rotate(0deg);
          }

          25% {
            transform:
              translateY(25vh)
              translateX(-20px)
              rotate(120deg);
          }

          50% {
            transform:
              translateY(50vh)
              translateX(20px)
              rotate(200deg);
          }

          75% {
            transform:
              translateY(75vh)
              translateX(-15px)
              rotate(300deg);
          }

          100% {
            transform:
              translateY(110vh)
              translateX(10px)
              rotate(360deg);
          }
        }
        `}
        </style>
      </Box>
    );
  }

  /* Apple Liquid Glass */
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background:
          "linear-gradient(140deg,#020617 0%,#0f172a 40%,#020617 100%)"
      }}
    >
      {/* soft color light */}
      <Box
        sx={{
          position: "absolute",
          width: 800,
          height: 800,
          top: "20%",
          left: "60%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)",
          filter: "blur(120px)",
          animation: "drift 25s ease-in-out infinite alternate"
        }}
      />

      <style>
        {`
        @keyframes drift {
          0% { transform: translate(-10%,-10%) }
          100% { transform: translate(10%,10%) }
        }
        `}
      </style>
    </Box>
  )
}