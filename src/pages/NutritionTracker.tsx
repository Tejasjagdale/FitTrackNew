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

type Meal = {
  name: string;
  detail: string;
};

// ---------- HELPERS ----------

function getLatestWeight(dailyWeight: Record<string, number>): number {
  const sortedDates = Object.keys(dailyWeight).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
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

// ---------- COMPONENT ----------

export default function NutritionPage() {
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const theme = useTheme();
  const [meals, setMeals] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [targets, setTargets] = useState<any>(null);

  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [mealName, setMealName] = useState("");
  const [mealDetail, setMealDetail] = useState("");

  useEffect(() => {
    const init = async () => {
      await loadProgressData();
      const data = getProgressData();

      setSavedMeals(data.meals || []);

      // 🔥 calculate targets
      const weight = getLatestWeight(data.dailyWeight);
      const t = calculateTargets(weight, data.profile.goalWeight);
      setTargets(t);
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

    setSavedMeals([...data.meals]);
    setOpen(false);
  };

  const handleDeleteMeal = async (index: number) => {
    const data = getProgressData();
    data.meals.splice(index, 1);

    setProgressData(data);
    await syncProgressToGitHub("Delete meal");

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
      const res = await analyzeMeals(meals);
      setResult(res);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box maxWidth={600} mx="auto">

        <Typography variant="h5" color={theme.palette.text.primary} fontWeight={600}>
          Daily Nutrition
        </Typography>

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

        <Button onClick={addMealInput} sx={{ mt: 2 }}>
          + Add Meal
        </Button>

        <Button fullWidth variant="contained" onClick={handleCalculate} sx={{ mt: 2 }}>
          {loading ? <CircularProgress size={24} /> : "Calculate"}
        </Button>

        {/* ---------- RESULT ---------- */}
        {result && targets && (
          <Card sx={{ mt: 3 }}>
            <CardContent>

              {/* Header */}
              <Typography fontWeight={600} mb={2}>
                Daily Summary
              </Typography>

              {/* Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  rowGap: 1.5,
                  columnGap: 2,
                  alignItems: "center",
                }}
              >
                {/* Labels */}
                <Typography color="text.secondary"></Typography>
                <Typography fontWeight={500}>Target</Typography>
                <Typography fontWeight={500}>Actual</Typography>

                {/* Calories */}
                <Typography>Calories</Typography>
                <Typography>{targets.targetCalories}</Typography>
                <Typography
                  color={
                    result.calories > targets.targetCalories
                      ? "error.main"
                      : "success.main"
                  }
                >
                  {result.calories}
                </Typography>

                {/* Protein */}
                <Typography>Protein</Typography>
                <Typography>{targets.proteinTarget}g</Typography>
                <Typography
                  color={
                    result.protein < targets.proteinTarget
                      ? "error.main"
                      : "success.main"
                  }
                >
                  {result.protein}g
                </Typography>

                {/* Carbs */}
                <Typography>Carbs</Typography>
                <Typography>{targets.carbTarget}g</Typography>
                <Typography>{result.carbs}g</Typography>

                {/* Fats */}
                <Typography>Fats</Typography>
                <Typography>{targets.fatTarget}g</Typography>
                <Typography>{result.fats}g</Typography>
              </Box>

              {/* Status */}
              <Box mt={3}>
                <Typography
                  color={
                    result.protein_goal_met ? "success.main" : "error.main"
                  }
                  fontWeight={500}
                >
                  {result.protein_goal_met
                    ? "Protein goal achieved"
                    : "Protein goal not met"}
                </Typography>
              </Box>

              {/* Summary */}
              <Typography mt={1} color="text.secondary">
                {result.summary}
              </Typography>
            </CardContent>
          </Card>
        )}
        {/* ---------- SAVED MEALS ---------- */}
        <Box mt={5}>
          <Typography variant="h6" color={theme.palette.text.primary}>Saved Meals</Typography>

          {savedMeals.map((meal, index) => (
            <Card key={index} sx={{ mt: 2 }}>
              <CardContent sx={{ display: "flex" }}>
                <Box sx={{ flexGrow: 2 }}>
                  <Typography fontWeight={600}>{meal.name}</Typography>
                  <Typography variant="body2">
                    {meal.detail}
                  </Typography>
                </Box>

                <Box>
                  <IconButton onClick={() => openEditDialog(index)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteMeal(index)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Button onClick={openAddDialog} sx={{ mt: 2 }}>
            + Add Saved Meal
          </Button>
        </Box>

        {/* ---------- DIALOG ---------- */}
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

      </Box>
    </Box>
  );
}