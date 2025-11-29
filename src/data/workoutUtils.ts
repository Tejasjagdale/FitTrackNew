import { getData } from "./dataService";

export interface ExerciseOrder {
  step: number;
  name: string;
  set: number;
  reps: string;
  restSeconds: number;
  equipment: string[];
}

export interface ExerciseList {
  name: string;
  sets: number;
  reps: string;
}

export interface Variant {
  id:string;
  variantName: string;
  exercisesList: ExerciseList[];
  exerciseOrder: ExerciseOrder[];
}

export interface WorkoutData {
  variants: Variant[];
  weeklyOrder: string[];
}

export interface WorkoutState {
  currentDayIndex: number;
  currentStepIndex: number;
  workoutInProgress: boolean;
  completedVariants: string[];
}

const WORKOUT_STATE_KEY = "workoutState";
const WORKOUT_DATE_KEY = "workoutDate";

export const getWorkoutState = (): WorkoutState => {
  try {
    const stored = localStorage.getItem(WORKOUT_STATE_KEY);
    if (stored) {
      const parsed: WorkoutState = JSON.parse(stored);
      const lastDate = localStorage.getItem(WORKOUT_DATE_KEY);
      const today = new Date().toDateString();
      if (lastDate !== today) {
        // new day, reset step but keep completed variants
        const state: WorkoutState = {
          ...parsed,
          workoutInProgress: false,
          currentStepIndex: 0,
        };
        localStorage.setItem(WORKOUT_DATE_KEY, today);
        return state;
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to parse workout state", err);
  }

  const initial: WorkoutState = {
    currentDayIndex: 0,
    currentStepIndex: 0,
    workoutInProgress: false,
    completedVariants: [],
  };
  localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(initial));
  localStorage.setItem(WORKOUT_DATE_KEY, new Date().toDateString());
  return initial;
};

export const saveWorkoutState = (state: WorkoutState) => {
  localStorage.setItem(WORKOUT_STATE_KEY, JSON.stringify(state));
};

export const getTodayVariant = (): Variant | null => {
  const state = getWorkoutState();
  const workoutData: WorkoutData = getData();
  const allVariants = workoutData.variants;
  const weeklyOrder = workoutData.weeklyOrder;

  for (let i = state.currentDayIndex; i < weeklyOrder.length; i++) {
    const variantName = weeklyOrder[i];
    if (!state.completedVariants.includes(variantName)) {
      return allVariants.find((v) => v.variantName === variantName) || null;
    }
  }

  // all completed, restart from day 0
  return allVariants.find((v) => v.variantName === weeklyOrder[0]) || null;
};

export const getCurrentStep = (): ExerciseOrder | null => {
  const variant = getTodayVariant();
  if (!variant) return null;

  const state = getWorkoutState();
  return variant.exerciseOrder[state.currentStepIndex] || null;
};

export const advanceStep = () => {
  const state = getWorkoutState();
  const variant = getTodayVariant();
  if (!variant) return;

  const workoutData: WorkoutData = getData();
  state.currentStepIndex += 1;

  if (state.currentStepIndex >= variant.exerciseOrder.length) {
    state.workoutInProgress = false;
    if (!state.completedVariants.includes(variant.variantName)) {
      state.completedVariants.push(variant.variantName);
    }

    // advance to next variant
    state.currentDayIndex =
      (state.currentDayIndex + 1) % workoutData.weeklyOrder.length;
    state.currentStepIndex = 0;
  }

  saveWorkoutState(state);
};

export const undoStep = () => {
  const state = getWorkoutState();
  if (!state.workoutInProgress || state.currentStepIndex <= 0) return;

  state.currentStepIndex -= 1;
  saveWorkoutState(state);
};

export const startWorkout = () => {
  const state = getWorkoutState();
  state.workoutInProgress = true;
  state.currentStepIndex = 0;
  saveWorkoutState(state);
};

export const finishWorkout = () => {
  const state = getWorkoutState();
  const variant = getTodayVariant();
  const workoutData: WorkoutData = getData();
  if (variant && !state.completedVariants.includes(variant.variantName)) {
    state.completedVariants.push(variant.variantName);
  }
  state.workoutInProgress = false;
  state.currentDayIndex =
    (state.currentDayIndex + 1) % workoutData.weeklyOrder.length;
  state.currentStepIndex = 0;
  saveWorkoutState(state);
};
