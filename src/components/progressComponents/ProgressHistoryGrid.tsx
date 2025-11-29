import React, { useMemo, useState } from "react";
import { Box, Typography, Grid, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { MeasurementsEntry, WorkoutLogEntry } from "../../data/progressTypes";

type Props = {
  dailyWeight: Record<string, number>;
  measurements: Record<string, MeasurementsEntry>;
  workouts: WorkoutLogEntry[];

  onUpdateWeight: (date: string, weight: number) => void;
  onUpdateMeasurement: (date: string, updated: MeasurementsEntry) => void;
  onUpdateWorkout: (index: number, updated: WorkoutLogEntry) => void;
};

export default function ProgressHistoryGrid({
  dailyWeight,
  measurements,
  workouts,
  onUpdateWeight,
  onUpdateMeasurement,
  onUpdateWorkout
}: Props) {
  const [filter, setFilter] = useState("");

  //
  // DAILY WEIGHT
  //
  const weightRows = Object.keys(dailyWeight)
    .sort()
    .map(date => ({
      id: date,
      date,
      weight: dailyWeight[date]
    }));

  const filteredWeightRows = weightRows.filter(r =>
    r.date.toLowerCase().includes(filter.toLowerCase())
  );

  const weightCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120, editable: false },
    {
      field: "weight",
      headerName: "Weight (kg)",
      width: 130,
      editable: true,
      type: "number"
    }
  ];

  //
  // MEASUREMENTS
  //
  const measurementDates = Object.keys(measurements).sort();

  const measurementKeys = useMemo(() => {
    const set = new Set<string>();
    measurementDates.forEach(d => {
      Object.keys(measurements[d] || {}).forEach(k => set.add(k));
    });
    return Array.from(set);
  }, [measurements, measurementDates]);

  const measurementRows = measurementDates.map(date => ({
    id: date,
    date,
    ...measurements[date]
  }));

  const filteredMeasurementRows = measurementRows.filter(r =>
    r.date.toLowerCase().includes(filter.toLowerCase())
  );

  // Cast dynamic columns to GridColDef to avoid TS errors
  const measurementCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120, editable: false },
    ...measurementKeys.map(
      key =>
        ({
          field: key,
          headerName: key,
          width: 110,
          editable: true,
          type: "number"
        } as GridColDef)
    )
  ];

  //
  // WORKOUTS
  //
  const workoutRows = workouts.map((w, index) => ({
    id: index,
    ...w
  }));

  const filteredWorkoutRows = workoutRows.filter(r => {
    const s = filter.toLowerCase();
    return (
      r.date?.toLowerCase().includes(s) ||
      r.variantName?.toLowerCase().includes(s)
    );
  });

  const workoutCols: GridColDef[] = [
    { field: "date", headerName: "Date", width: 120, editable: true },
    { field: "exercise", headerName: "Exercise", width: 160, editable: true },
    {
      field: "weight",
      headerName: "Weight",
      width: 100,
      editable: true,
      type: "number"
    },
    {
      field: "reps",
      headerName: "Reps",
      width: 90,
      editable: true,
      type: "number"
    },
    {
      field: "sets",
      headerName: "Sets",
      width: 90,
      editable: true,
      type: "number"
    }
  ];

  //
  // UI
  //
  return (
    <Box sx={{ mt: 4 }}>
      {/* Quick Filter */}
      <TextField
        fullWidth
        label="Filter dates, exercises..."
        variant="outlined"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Weight + Workouts side-by-side */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Daily Weight
          </Typography>

          <DataGrid
            rows={filteredWeightRows}
            columns={weightCols}
            autoHeight
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } }
            }}
            disableRowSelectionOnClick
            processRowUpdate={(newRow) => {
              onUpdateWeight(newRow.id, Number(newRow.weight) || 0);
              return newRow;
            }}
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Workout Log
          </Typography>

          <DataGrid
            rows={filteredWorkoutRows}
            columns={workoutCols}
            autoHeight
            pageSizeOptions={[5, 10, 20]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } }
            }}
            disableRowSelectionOnClick
            processRowUpdate={(newRow) => {
              const updated = { ...newRow };
              delete updated.id;
              onUpdateWorkout(newRow.id as number, updated);
              return newRow;
            }}
          />
        </Grid>
      </Grid>

      {/* Measurements */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Measurements
        </Typography>

        <DataGrid
          rows={filteredMeasurementRows}
          columns={measurementCols}
          autoHeight
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } }
          }}
          disableRowSelectionOnClick
          processRowUpdate={(newRow) => {
            const updated: any = {};
            measurementKeys.forEach(key => {
              updated[key] = Number(newRow[key]) || 0;
            });
            onUpdateMeasurement(newRow.id, updated);
            return newRow;
          }}
        />
      </Box>
    </Box>
  );
}
