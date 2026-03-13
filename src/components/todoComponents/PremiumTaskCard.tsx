import {
  Paper,
  Stack,
  Typography,
  Checkbox,
  Box,
  Chip,
  IconButton,
  useTheme
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import { useState } from "react";

import { Routine } from "../../types/todoModels";
import RoutineInsightDialog from "./RoutineInsightPanel";

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

  /* NEW */
  routine?: Routine | null;
  onRoutineHistoryChange?: (routineId: string, history: string[]) => void;
  variant?: "default" | "calendar";
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
  streak,
  routine,
  onRoutineHistoryChange,
  variant = "default"
}: Props) {
  const statusLabel = done
    ? "Completed"
    : isOverdue
      ? "Overdue"
      : "Pending";
  const theme = useTheme();

  const [openRoutineDialog, setOpenRoutineDialog] = useState(false);

  const groupLabels = groups.filter((g: any) =>
    groupIds.includes(g.id)
  );

  const isActive = (isOverdue || isUrgent) && !done;

  const isRoutine = !!routine;

  const handleMiddleClick = () => {

    if (!isRoutine) return;

    setOpenRoutineDialog(true);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          px: variant === "calendar" ? 0.6 : { xs: 0.6, sm: 1 },
          py: variant === "calendar" ? 0.8 : { xs: 1.1, sm: 1.2 },
          borderRadius: 1.8,
          position: "relative",

          background: isActive
            ? `${theme.palette.error.main}30`
            : theme.palette.background.paper,

          backdropFilter: "blur(12px)",

          boxShadow:
            theme.palette.mode === "light"
              ? "0 8px 24px rgba(0,0,0,0.10)"
              : "0 6px 16px rgba(0,0,0,0.01)",

          border: isActive
            ? `1px solid ${theme.palette.error.main}50`
            : `1px solid ${theme.palette.divider}`,

          transition: "all .28s ease",

          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.45)"
                : "0 6px 16px rgba(0,0,0,0.08)"
          },

          animation: isActive ? "premiumPulse 3s ease-in-out infinite" : "none",

          "@keyframes premiumPulse": {
            "0%": {
              boxShadow: `0 0 0px ${theme.palette.error.main}20`
            },
            "50%": {
              boxShadow: `0 0 20px ${theme.palette.error.main}60`
            },
            "100%": {
              boxShadow: `0 0 0px ${theme.palette.error.main}20`
            }
          }
        }}
      >

        <Stack direction="row" alignItems="center" spacing={1.2}>

          {/* CHECKBOX */}
          <Checkbox
            checked={done}
            onChange={onToggle}
            sx={{
              pr: 0.2,
              color: theme.palette.primary.main,
              "&.Mui-checked": {
                color: theme.palette.primary.main
              }
            }}
          />

          {/* CLICKABLE CENTER AREA */}
          <Box
            sx={{ flex: 1, cursor: isRoutine ? "pointer" : "default" }}
            onClick={handleMiddleClick}
          >

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.92rem", sm: ".95rem" },
                color: theme.palette.text.primary,
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

              {variant === "calendar" && (
                <Chip
                  size="small"
                  label={statusLabel}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    background:
                      statusLabel === "Completed"
                        ? `${theme.palette.success.main}22`
                        : statusLabel === "Overdue"
                          ? `${theme.palette.error.main}22`
                          : `${theme.palette.info.main}22`,
                    color:
                      statusLabel === "Completed"
                        ? theme.palette.success.main
                        : statusLabel === "Overdue"
                          ? theme.palette.error.main
                          : theme.palette.info.main
                  }}
                />
              )}

              {/* STREAK CHIP */}
              {typeof streak === "number" && streak > 0 && (
                <Chip
                  size="small"
                  icon={<LocalFireDepartmentIcon sx={{ fontSize: 14 }} />}
                  label={streak}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    background: `${theme.palette.warning.main}22`,
                    border: `1px solid ${theme.palette.warning.main}55`,
                    color: theme.palette.warning.main
                  }}
                />
              )}

              {/* TIME CHIP */}
              {meta && variant !== "calendar" && (
                <Chip
                  size="small"
                  icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                  label={meta}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    background: isOverdue
                      ? `${theme.palette.error.main}22`
                      : `${theme.palette.primary.main}22`,
                    color: theme.palette.text.primary
                  }}
                />
              )}

              {/* GROUP CHIPS */}
              {groupLabels.map((g: any) => (
                <Chip
                  key={g.id}
                  size="small"
                  label={g.name}
                  sx={{
                    height: 18,
                    fontSize: 10,
                    background: `${theme.palette.secondary.main}22`,
                    border: `1px solid ${theme.palette.secondary.main}55`,
                    color: theme.palette.secondary.main
                  }}
                />
              ))}

            </Stack>
          </Box>

          {/* EDIT BUTTON */}
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                background: theme.palette.action.hover
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

        </Stack>
      </Paper>

      {/* ROUTINE DIALOG */}
      {routine && (
        <RoutineInsightDialog
          open={openRoutineDialog}
          onClose={() => setOpenRoutineDialog(false)}
          routine={routine}
          onHistoryChange={onRoutineHistoryChange}
        />
      )}

    </>
  );
}