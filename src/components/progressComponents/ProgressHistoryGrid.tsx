// src/components/progressComponents/ProgressHistoryGrid.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Chip,
  MenuItem,
  Select
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderEditCellParams
} from "@mui/x-data-grid";

import {
  MeasurementsEntry,
  WorkoutLogEntry,
} from "../../data/progressTypes";

type Props = {
  dailyWeight: Record<string, number>;
  measurements: Record<string, MeasurementsEntry>;
  workouts: WorkoutLogEntry[];
  onUpdateWeight: (date: string, weight: number) => void;
  onUpdateMeasurement: (date: string, updated: MeasurementsEntry) => void;
  onUpdateWorkout: (index: number, updated: WorkoutLogEntry) => void;
};

function formatTime(ts?: string): string {
  if (!ts) return "—"

  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "—"

  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  })
}

function formatDuration(start?: string, end?: string): string {
  if (!start || !end) return "—"

  const s = new Date(start).getTime()
  const e = new Date(end).getTime()

  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return "—"

  const mins = Math.floor((e - s) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60

  return h > 0 ? `${h}h ${m}m` : `${m}m`
}


/* -------------------------------------------------------
   SMART BODY PART EXTRACTION
-------------------------------------------------------- */
function extractBodyPart(title: string): string {
  if (!title) return "Unknown";

  const lower = title.toLowerCase();

  const map: Record<string, string> = {
    arm: "Arms",
    tricep: "Arms",
    bicep: "Arms",

    pull: "Back",
    back: "Back",
    row: "Back",
    lat: "Back",

    push: "Chest",
    chest: "Chest",
    pec: "Chest",

    shoulder: "Shoulders",
    delt: "Shoulders",

    leg: "Legs",
    squat: "Legs",
    quad: "Legs",
    hamstring: "Legs",
    calf: "Legs",

    abs: "Abs",
    core: "Abs"
  };

  const detected = new Set<string>();
  Object.keys(map).forEach(k => lower.includes(k) && detected.add(map[k]));

  if (detected.size === 0) return "Unknown";
  if (detected.size === 1) return [...detected][0];
  return "Full Body";
}

/* -------------------------------------------------------
   COLORED CHIP UTILS
-------------------------------------------------------- */
function coloredChip(bodyPart: string) {
  const colors: Record<string, string> = {
    Arms: "#2196f3",
    Chest: "#e53935",
    Back: "#8e24aa",
    Legs: "#43a047",
    Shoulders: "#fb8c00",
    Abs: "#26a69a",
    "Full Body": "#9e9e9e",
    Unknown: "#616161"
  };

  return (
    <Chip
      label={bodyPart}
      size="small"
      sx={{
        background: colors[bodyPart] + "66",
        color: "white",
        fontWeight: 600
      }}
    />
  );
}

/* -------------------------------------------------------
   BACKGROUND COLOR FOR CELLS
-------------------------------------------------------- */
const applyCellStyle = (color: string) => ({
  backgroundColor: color,
  color: "white",
  fontWeight: 600,
  borderRadius: "4px",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

/* -------------------------------------------------------
   SELECT DROPDOWN FOR HEALTH GRID
-------------------------------------------------------- */
function SelectEditCell(params: GridRenderEditCellParams) {
  const { id, field, value, api } = params;

  const colDef: any = params.colDef;
  const options = colDef.valueOptions ?? [];

  const handleChange = (event: any) => {
    api.setEditCellValue({ id, field, value: event.target.value }, event);
    setTimeout(() => api.stopCellEditMode({ id, field }));
  };

  return (
    <Select fullWidth autoFocus size="small" value={value} onChange={handleChange}>
      {options.map((opt: any) => {
        const val = typeof opt === "object" ? opt.value : opt;
        const label = typeof opt === "object" ? opt.label : String(opt);

        return (
          <MenuItem key={String(val)} value={val}>
            {label}
          </MenuItem>
        );
      })}
    </Select>
  );
}

/* -------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------- */

export default function ProgressHistoryGrid({
  dailyWeight,
  measurements,
  workouts,
  onUpdateWeight,
  onUpdateMeasurement,
  onUpdateWorkout
}: Props) {
  const [filter, setFilter] = useState("");

  const sortDesc = (arr: string[]) =>
    [...arr].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  /* ------------------------ DAILY WEIGHT ------------------------ */
  const weightRows = sortDesc(Object.keys(dailyWeight)).map(date => ({
    id: date,
    date,
    weight: dailyWeight[date]
  }));

  const weightCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120 },
    { field: "weight", headerName: "Weight", width: 120, editable: true }
  ];

  /* ------------------------ MEASUREMENTS ------------------------ */
  const measurementDates = sortDesc(Object.keys(measurements));

  const measurementKeys = useMemo(() => {
    const s = new Set<string>();
    measurementDates.forEach(d => {
      Object.keys(measurements[d] || {}).forEach(k => s.add(k));
    });
    return [...s];
  }, [measurements]);

  const measurementRows = measurementDates.map(date => ({
    id: date,
    date,
    ...measurements[date]
  }));

  const measurementCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120 },
    ...measurementKeys.map(key => ({
      field: key,
      headerName: key,
      width: 110,
      editable: true,
      valueParser: (v: any) => Number(v) || 0
    }))
  ];

  /* ------------------------ WORKOUT LOG ------------------------ */
  const sortedWorkouts = useMemo(
    () => [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [workouts]
  );

  const workoutRows = sortedWorkouts.map((w, index) => ({
    id: index,
    ...w,
    bodyPart: extractBodyPart(w.variantName),
    startTimeFormatted: formatTime(w.startTime),
    endTimeFormatted: formatTime(w.endTime),
    duration: formatDuration(w.startTime, w.endTime)
  }))


  const workoutCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120 },
    { field: "variantName", headerName: "Workout", width: 220 },

    {
      field: "bodyPart",
      headerName: "Body Part",
      width: 140,
      renderCell: params => coloredChip(params.value)
    },

    {
      field: "completed",
      headerName: "Done?",
      width: 120,
      type: "boolean",
      editable: true,
      renderCell: params =>
        params.value ? (
          <Chip
            label="Completed"
            sx={{
              background: "#43a04766",
              color: "white",
              fontWeight: 600
            }}
            size="small"
          />
        ) : (
          <Chip
            label="Partialy"
            sx={{
              background: "#e5393566",
              color: "white",
              fontWeight: 600
            }}
            size="small"
          />
        )
    },
    {
      field: "startTimeFormatted",
      headerName: "Start",
      width: 110,
      align: "center",
      headerAlign: "center",
      sortable: false
    },
    {
      field: "endTimeFormatted",
      headerName: "End",
      width: 110,
      align: "center",
      headerAlign: "center",
      sortable: false
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 120,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: params => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            background:
              params.value === "—" ? "#61616166" : "#1e88e566",
            color: "white",
            fontWeight: 600
          }}
        />
      )
    }

  ];

  /* -------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <Box sx={{ mt: 4 }}>
      <TextField
        fullWidth
        label="Filter date / workout / body part..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2}>
        {/* WEIGHT */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
            Daily Weight
          </Typography>

          <DataGrid
            rows={weightRows.filter(r => r.date.includes(filter))}
            columns={weightCols}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[7]}
            initialState={{ pagination: { paginationModel: { pageSize: 7, page: 0 } } }}
            processRowUpdate={row => {
              onUpdateWeight(row.id, row.weight);
              return row;
            }}
          />
        </Grid>

        {/* WORKOUTS */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
            Workout Log
          </Typography>

          <DataGrid
            rows={workoutRows.filter(
              r =>
                r.date.includes(filter) ||
                r.variantName.toLowerCase().includes(filter.toLowerCase()) ||
                r.bodyPart.toLowerCase().includes(filter.toLowerCase())
            )}
            columns={workoutCols}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[7]}
            initialState={{ pagination: { paginationModel: { pageSize: 7, page: 0 } } }}
            processRowUpdate={row => {
              const updated = { ...row };
              delete updated.id;
              onUpdateWorkout(row.id, updated);
              return row;
            }}
          />
        </Grid>
      </Grid>

      {/* MEASUREMENTS */}
      <Box sx={{ mt: 2,mb:2 }}>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 1 }}>
          Measurements
        </Typography>

        <DataGrid
          rows={measurementRows.filter(r => r.date.includes(filter))}
          columns={measurementCols}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[7]}
          initialState={{ pagination: { paginationModel: { pageSize: 7, page: 0 } } }}
          processRowUpdate={row => {
            const updated: any = {};
            measurementKeys.forEach(k => {
              updated[k] = Number(row[k]) || 0;
            });
            onUpdateMeasurement(row.id, updated);
            return row;
          }}
        />
      </Box>

    </Box>
  );
}
