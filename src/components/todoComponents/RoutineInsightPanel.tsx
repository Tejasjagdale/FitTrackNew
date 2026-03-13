import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Box,
  useTheme
} from "@mui/material";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

import { Routine } from "../../types/todoModels";
import RoutineMonthCalendar from "./RoutineMonthCalendar";

type Props = {
  open: boolean;
  onClose: () => void;
  routine: Routine | null;
  onHistoryChange?: (routineId: string, history: string[]) => void;
};

export default function RoutineInsightDialog({
  open,
  onClose,
  routine,
  onHistoryChange
}: Props) {

  const theme = useTheme();

  if (!routine) return null;

  const momentum = routine.streak?.current ?? 0;
  const longest = routine.streak?.longest ?? 0;

  const history = routine.history ?? [];

  const consistency =
    history.length === 0
      ? 0
      : Math.round(
        (history.length /
          Math.max(
            1,
            Math.ceil(
              (Date.now() -
                new Date(history[0]).getTime()) /
              (1000 * 60 * 60 * 24)
            )
          )) *
        100
      );

  const showFlame = momentum >= 3;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(20px)"
        }
      }}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 2.4 } }}>

        {/* TITLE */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          mb={1.6}
        >
          <Typography
            fontWeight={700}
            fontSize={{ xs: 18, sm: 20 }}
          >
            🔁 {routine.title}
          </Typography>

          {showFlame && (
            <LocalFireDepartmentIcon
              sx={{
                color: "#ff784e",
                fontSize: 20,
                animation: "flame 1.4s ease-in-out infinite"
              }}
            />
          )}

          <style>
            {`
            @keyframes flame {
              0% { transform: scale(1); opacity:.8 }
              50% { transform: scale(1.25); opacity:1 }
              100% { transform: scale(1); opacity:.8 }
            }
            `}
          </style>
        </Stack>

        {/* METRICS */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="space-between"
          mb={1}
          p={2}
          borderRadius={1}
          sx={{background:theme.palette.background.paper}}
        >
          <Metric
            label="Momentum"
            value={momentum}
            color="#ff784e"
          />

          <Metric
            label="Consistency"
            value={`${consistency}%`}
            color={theme.palette.primary.main}
          />

          <Metric
            label="Longest"
            value={longest}
            color={theme.palette.success.main}
          />
        </Stack>

        {/* CALENDAR */}
        <RoutineMonthCalendar
          routine={routine}
          onToggleDate={(date) => {

            const exists = routine.history?.includes(date);

            let newHistory;

            if (exists) {
              newHistory = routine.history?.filter(d => d !== date) ?? [];
            } else {
              newHistory = [...(routine.history ?? []), date];
            }

            onHistoryChange?.(routine.id, newHistory);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function Metric({
  label,
  value,
  color
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <Stack alignItems="center" spacing={0.2}>
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
          color
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 11,
          opacity: 0.7
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}