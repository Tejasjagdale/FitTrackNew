import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import {
  loadProgressData,
  getProgressData,
  setProgressData,
  syncProgressToGitHub,
} from "../data/progressDataService";

import { analyzeMeals, NutritionResult } from "../utils/nutritionAnalyzer";
import NutritionHistoryDialog from "../components/NutritionHistoryDialog";

type Meal = {
  name: string;
  detail: string;
};

// ---------- HELPERS ----------

function getLatestWeight(dailyWeight: Record<string, number>): number {
  const sortedDates = Object.keys(dailyWeight).sort(
    (a, b) => new Date(b + "T00:00:00+05:30").getTime() - new Date(a).getTime()
  );
  return dailyWeight[sortedDates[0]];
}

function calculateTargets(weight: number, goalWeight: number) {
  const isGain = goalWeight > weight;

  const maintenance = weight * 33;

  const targetCalories = isGain
    ? maintenance + 300
    : maintenance - 400;

  const protein = weight * 1.8;
  const fats = weight * 0.8;
  const carbs =
    (targetCalories - (protein * 4 + fats * 9)) / 4;

  return {
    goalType: isGain ? "gain" : "cut",
    targetCalories: Math.round(targetCalories),
    proteinTarget: Math.round(protein),
    fatTarget: Math.round(fats),
    carbTarget: Math.round(carbs),
  };
}

function getTodayKeyIST() {
  const now = new Date();

  const istOffset = 5.5 * 60; // minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + istOffset * 60000);

  const y = istTime.getFullYear();
  const m = String(istTime.getMonth() + 1).padStart(2, "0");
  const d = String(istTime.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function getISTDate(date = new Date()) {
  const istOffset = 5.5 * 60;
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset * 60000);
}

function getISTDateParts(date = new Date()) {
  const d = getISTDate(date);

  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  };
}

// ---------- COMPONENT ----------

export default function NutritionPage() {
  const theme = useTheme();
  const [savedMealsOpen, setSavedMealsOpen] = useState(false);
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [meals, setMeals] = useState<string[]>([""]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [result, setResult] = useState<NutritionResult | null>(null);
  const [targets, setTargets] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealDetail, setMealDetail] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  function prepareHistory() {
    const raw = getProgressData().nutritionTracker || {};

    return Object.entries(raw).map(([date, value]: any) => ({
      date,
      calories: value.calories,
      protein: value.protein,
      carbs: value.carbs,
      fats: value.fats,
      meals: value.meals || [],
      summary: value.summary,
      targets: value.targets || {}
    }));
  }

  useEffect(() => {
    const init = async () => {
      await loadProgressData();
      const data = getProgressData();

      setSavedMeals(data.meals || []);

      const weight = getLatestWeight(data.dailyWeight);
      const t = calculateTargets(weight, data.profile.goalWeight);
      setTargets(t);

      setHistoryData(prepareHistory());
    };

    init();
  }, []);

  // ---------- CRUD ----------

  const openAddDialog = () => {
    setEditingIndex(null);
    setMealName("");
    setMealDetail("");
    setOpen(true);
  };

  const openEditDialog = (index: number) => {
    const meal = savedMeals[index];
    setEditingIndex(index);
    setMealName(meal.name);
    setMealDetail(meal.detail);
    setOpen(true);
  };

  const refreshHistory = () => {
    const fresh = prepareHistory();
    setHistoryData(fresh);
  };

  const handleSaveMeal = async () => {
    if (!mealName || !mealDetail) return;

    const data = getProgressData();

    if (editingIndex !== null) {
      data.meals[editingIndex] = { name: mealName, detail: mealDetail };
    } else {
      data.meals.push({ name: mealName, detail: mealDetail });
    }

    setProgressData(data);
    await syncProgressToGitHub("Update meals");
    setSnackbarOpen(true);

    setSavedMeals([...data.meals]);
    setOpen(false);
  };

  const handleDeleteMeal = async (index: number) => {
    const data = getProgressData();
    data.meals.splice(index, 1);

    setProgressData(data);
    await syncProgressToGitHub("Delete meal");
    setSnackbarOpen(true);

    setSavedMeals([...data.meals]);
  };

  // ---------- INPUT ----------

  const handleMealChange = (index: number, value: string) => {
    const updated = [...meals];
    updated[index] = value;
    setMeals(updated);
  };

  const addMealInput = () => setMeals([...meals, ""]);

  // ---------- AI ----------

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeMeals(meals, targets);
      setResult(res);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // ---------- SAVE FIX ----------

  const handleSaveNutrition = async () => {
    if (!result) return;

    setSaving(true);

    try {
      const data = getProgressData();

      if (
        !data.nutritionTracker ||
        Array.isArray(data.nutritionTracker)
      ) {
        data.nutritionTracker = {};
      }

      const dateKey = selectedDate || getTodayKeyIST();

      data.nutritionTracker[dateKey] = {
        ...result,
        targets,
        meals,
        timestamp: new Date().toISOString(),
      };

      setProgressData(data);
      await syncProgressToGitHub("Save nutrition log");
      setSnackbarOpen(true);

      // 🔥 REFRESH UI
      refreshHistory();
    } catch (err) {
      console.error("Save failed:", err);
    }

    setSaving(false);
  };

  return (
    <Box sx={{ p: 1, mt: 2 }}>
      <Box maxWidth={600} mx="auto">

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2
          }}
        >
          {/* LEFT: TITLE */}
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
            >
              Nutrition Intelligence
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.3 }}
            >
              Track your daily intake
            </Typography>
          </Box>

          {/* RIGHT: BUTTON */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSavedMealsOpen(true)}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2,
              height: 36,
              borderColor: theme.palette.divider,
              color: "text.primary",

              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            Meals
          </Button>
        </Box>

        <NutritionHistoryDialog
          data={historyData}
          onDateClick={(day: any) => {
            setSelectedDate(day.dateStr);

            if (day.entry) {
              // EDIT MODE
              setMeals(day.entry.meals || []);
              setResult(day.entry);
            } else {
              // NEW ENTRY
              setMeals([""]);
              setResult(null);
            }

            setNutritionOpen(true);
          }}
          onEditDay={(day: any) => {
            setSelectedDate(day.dateStr);
            setMeals(day.entry.meals || []);
            setResult(day.entry);
            setNutritionOpen(true);
          }}
        />

        <Dialog
          open={savedMealsOpen}
          onClose={() => setSavedMealsOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Saved Meals
              </Typography>

              <Button
                variant="contained"
                size="small"
                onClick={openAddDialog}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                + Add Meal
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent>
            {savedMeals.map((meal, index) => (
              <Card key={index} sx={{ mt: 2 }}>
                <CardContent sx={{ display: "flex" }}>
                  <Box sx={{ flexGrow: 2 }}>
                    <Typography fontWeight={600}>{meal.name}</Typography>
                    <Typography variant="body2">{meal.detail}</Typography>
                  </Box>

                  <Box>
                    <IconButton onClick={() => openEditDialog(index)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteMeal(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}


          </DialogContent>

          <DialogActions>
            <Button color="error" onClick={() => setSavedMealsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            {editingIndex !== null ? "Edit Meal" : "Add Meal"}
          </DialogTitle>

          <DialogContent>
            <TextField
              fullWidth
              label="Meal Name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              sx={{ mt: 1 }}
            />
            <TextField
              fullWidth
              label="Meal Detail"
              value={mealDetail}
              onChange={(e) => setMealDetail(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMeal}>Save</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={nutritionOpen}
          onClose={() => setNutritionOpen(false)}
          fullWidth
          maxWidth="sm"
        >

          <DialogTitle sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {selectedDate}
              </Typography>

              <Button variant="contained"
                size="small" onClick={addMealInput} sx={{ textTransform: "none", borderRadius: 2 }}>
                + Add Meal
              </Button>
            </Box>
          </DialogTitle>

          <DialogContent>

            {/* ---------- INPUT ---------- */}
            {meals.map((meal, index) => (
              <Box key={index} mt={2}>
                <Autocomplete
                  freeSolo
                  options={savedMeals}
                  filterOptions={(options, { inputValue }) =>
                    options.filter((o) =>
                      o.name.toLowerCase().includes(inputValue.toLowerCase())
                    )
                  }
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.name
                  }
                  value={meal}
                  onInputChange={(_, value) =>
                    handleMealChange(index, value)
                  }
                  onChange={(_, value) => {
                    if (typeof value === "string") {
                      handleMealChange(index, value);
                    } else if (value) {
                      handleMealChange(index, value.detail);
                    }
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography fontWeight={600}>
                          {option.name}
                        </Typography>
                        <Typography variant="body2">
                          {option.detail}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label={`Meal ${index + 1}`} />
                  )}
                />
              </Box>
            ))}



            <Button
              fullWidth
              variant="contained"
              onClick={handleCalculate}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Calculate"}
            </Button>

            {/* RESULT stays EXACTLY same */}
            {result && targets && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  {/* ---------- RESULT ---------- */}
                  {result && targets && (
                    <Box >
                      <Typography fontWeight={600} mb={2}>
                        Nutrition Summary
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto",
                          rowGap: 1.5,
                          columnGap: 2,
                          alignItems: "center",
                        }}
                      >
                        <Typography></Typography>
                        <Typography fontWeight={500}>Target</Typography>
                        <Typography fontWeight={500}>Actual</Typography>

                        <Typography>Calories</Typography>
                        <Typography>{targets.targetCalories}</Typography>
                        <Typography
                          color={
                            targets.goalType === "gain" ?
                              result.calories > targets.targetCalories ?
                                "success.main" : "error.main" :
                              result.calories < targets.targetCalories ?
                                "success.main" : "error.main"
                          }
                        >
                          {result.calories}
                        </Typography>

                        <Typography>Protein</Typography>
                        <Typography>{targets.proteinTarget}g</Typography>
                        <Typography
                          color={result.protein < targets.proteinTarget ? "error.main" : "success.main"}>
                          {result.protein}g
                        </Typography>

                        <Typography>Carbs</Typography>
                        <Typography>{targets.carbTarget}g</Typography>
                        <Typography color={result.carbs < targets.carbTarget ? "error.main" : "success.main"}>{result.carbs}g</Typography>

                        <Typography>Fats</Typography>
                        <Typography>{targets.fatTarget}g</Typography>
                        <Typography color={result.fats > targets.fatTarget ? "error.main" : "success.main"}>{result.fats}g</Typography>
                      </Box>

                      {/* SAVE BUTTON */}
                      <Box
                        mt={3}
                        sx={{
                          display: "flex",
                          gap: 2
                        }}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleSaveNutrition}
                          disabled={saving}
                          color="success"
                          sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            height: 42
                          }}
                        >
                          {saving ? <CircularProgress size={20} /> : "Save This Log"}
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setNutritionOpen(false)}
                          disabled={saving}
                          color="error"
                          sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            height: 42
                          }}
                        >
                          Close
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

          </DialogContent>
        </Dialog>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            alignItems: "center"
          }}
        >
          Changes completed
        </Alert>
      </Snackbar>
    </Box>
  );
}