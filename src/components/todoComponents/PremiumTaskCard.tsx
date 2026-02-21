import {
  Paper,
  Stack,
  Typography,
  Checkbox,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useState } from "react";

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
  streak?: number;
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
  isUrgent = false,
  streak
}: Props) {

  const [confirmOpen, setConfirmOpen] = useState(false);

  const groupLabels = groups.filter((g: any) =>
    groupIds.includes(g.id)
  );

  const isActive = (isOverdue || isUrgent) && !done;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          px: 0.5,
          py: 1.2,
          borderRadius: 1,
          position: "relative",

          /* NEW PREMIUM GREEN SURFACE */
          background: isActive
            ? 'linear-gradient(160deg, rgba(255,80,80,0.20) 0%, rgba(255,80,80,0.10) 100%)'
            : '',

          backdropFilter: "blur(12px)",

          border: isActive
            ? "1px solid rgba(255,80,80,0.35)"
            : "",

          transition: "all .35s ease",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: isActive
              ? "0 10px 28px rgba(255,80,80,0.25)"
              : "0 10px 28px rgba(0,0,0,0.45)"
          },

          animation: isActive
            ? "premiumPulse 3s ease-in-out infinite"
            : "none",

          "@keyframes premiumPulse": {
            "0%": {
              boxShadow: isActive
                ? "0 0 0px rgba(255,80,80,0.15)"
                : "0 0 0px rgba(0,0,0,0.12)"
            },
            "50%": {
              boxShadow: isActive
                ? "0 0 22px rgba(255,80,80,0.45)"
                : "0 0 18px rgba(0,0,0,0.35)"
            },
            "100%": {
              boxShadow: isActive
                ? "0 0 0px rgba(255,80,80,0.15)"
                : "0 0 0px rgba(0,0,0,0.12)"
            }
          }
        }}
      >

        <Stack direction="row" alignItems="center" spacing={1.2}>

          <Checkbox
            checked={done}
            onChange={onToggle}
            sx={{ pr: 0.2 }}
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

            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              mt={0.4}
              flexWrap="wrap"
            >

              {/* 🔥 STREAK CHIP */}
              { typeof streak === "number" && (streak > 0) && (
                <Chip
                  size="small"
                  icon={<LocalFireDepartmentIcon sx={{ fontSize: 14 }} />}
                  label={streak}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    background:
                      "linear-gradient(135deg,rgba(255,120,40,0.25),rgba(255,80,0,0.15))",
                    border: "1px solid rgba(255,140,60,0.35)",
                    color: "#ffb36b"
                  }}
                />
              )}

              {/* TIME CHIP */}
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
                  }}
                  color="success"
                />
              ))}

            </Stack>
          </Box>

          {/* EDIT BUTTON */}
          <IconButton size="small" onClick={onEdit}>
            <EditIcon fontSize="small" />
          </IconButton>


        </Stack>
      </Paper>
    </>
  );
}
