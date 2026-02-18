import {
  Paper,
  Stack,
  Typography,
  Checkbox,
  Box,
  Chip,
  IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Props {
  title: string;
  done: boolean;
  meta?: string;
  onToggle: () => void;
  onEdit: () => void;
  groups?: any[];
  groupIds?: string[];

  isOverdue?: boolean;
  isUrgent?: boolean;
}

export default function PremiumTaskCard({
  title,
  done,
  meta,
  onToggle,
  onEdit,
  groups = [],
  groupIds = [],
  isOverdue = false,
  isUrgent = false
}: Props) {

  const groupLabels = groups.filter((g: any) =>
    groupIds.includes(g.id)
  );

  const isActive = isOverdue || isUrgent;

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.2,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",

        background: "#0c1411",
        border: isOverdue
          ? "1px solid rgba(255,80,80,0.35)"
          : "1px solid rgba(0,255,170,0.15)",

        transition: "all .35s ease",

        /* 🔥 PREMIUM BREATHING EFFECT */
        animation: (isActive && !done)
  ? "premiumPulse 3s ease-in-out infinite"
  : "none",

        "@keyframes premiumPulse": {
          "0%": {
            boxShadow: isOverdue
              ? "0 0 0px rgba(255,80,80,0.15)"
              : "0 0 0px rgba(0,255,170,0.12)",
            transform: "translateY(0px)"
          },
          "50%": {
            boxShadow: isOverdue
              ? "0 0 22px rgba(255,80,80,0.45)"
              : "0 0 18px rgba(0,255,170,0.35)",
            transform: "translateY(-1px)"
          },
          "100%": {
            boxShadow: isOverdue
              ? "0 0 0px rgba(255,80,80,0.15)"
              : "0 0 0px rgba(0,255,170,0.12)",
            transform: "translateY(0px)"
          }
        },

        /* ✨ SHIMMER OVERLAY FOR URGENT */
        ...(isUrgent && !isOverdue && !done && {
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(120deg, transparent 0%, rgba(0,255,170,0.12) 50%, transparent 100%)",
            animation: "shimmer 2.8s linear infinite"
          },

          "@keyframes shimmer": {
            "0%": { transform: "translateX(-120%)" },
            "100%": { transform: "translateX(120%)" }
          }
        })
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2}>

        <Checkbox
          checked={done}
          onChange={onToggle}
          sx={{ p: 0.4 }}
        />

        <Box sx={{ flex: 1 }}>

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: ".95rem",
              opacity: done ? 0.5 : 1
            }}
          >
            {title}
          </Typography>

          {/* META + GROUP CHIPS */}
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            mt={0.4}
            flexWrap="wrap"
          >

            {meta && (
              <Chip
                size="small"
                icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                label={meta}
                sx={{
                  height: 18,
                  fontSize: 10,
                  background: isOverdue
                    ? "rgba(255,80,80,0.25)"
                    : "rgba(0,255,170,0.18)"
                }}
              />
            )}

            {groupLabels.map((g: any) => (
              <Chip
                key={g.id}
                size="small"
                label={g.name}
                sx={{
                  height: 18,
                  fontSize: 10,
                  background: "rgba(0,255,170,0.08)"
                }}
              />
            ))}

          </Stack>

        </Box>

        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>

      </Stack>
    </Paper>
  );
}
