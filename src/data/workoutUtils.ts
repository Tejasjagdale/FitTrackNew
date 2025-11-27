import { getData } from './dataService'

export type Variant = any
export type ExerciseOrder = any

export interface WorkoutState {
  currentDayIndex: number
  currentStepIndex: number
  workoutInProgress: boolean
  completedVariants: string[]
}

export const getWorkoutState = (): WorkoutState => {
  try {
    const stored = localStorage.getItem('workoutState')
    if (stored) {
      const parsed = JSON.parse(stored)
      // check if we need to reset (new day)
      const lastDate = localStorage.getItem('workoutDate')
      const today = new Date().toDateString()
      if (lastDate !== today) {
        // new day, check if current variant is done
        const state = { ...parsed, workoutInProgress: false, currentStepIndex: 0 }
        localStorage.setItem('workoutDate', today)
        return state
      }
      return parsed
    }
  } catch {}

  // initialize
  const initial: WorkoutState = {
    currentDayIndex: 0,
    currentStepIndex: 0,
    workoutInProgress: false,
    completedVariants: []
  }
  localStorage.setItem('workoutState', JSON.stringify(initial))
  localStorage.setItem('workoutDate', new Date().toDateString())
  return initial
}

export const saveWorkoutState = (state: WorkoutState) => {
  localStorage.setItem('workoutState', JSON.stringify(state))
}

export const getTodayVariant = (): Variant | null => {
  const state = getWorkoutState()
  const workoutData = getData()
  const allVariants = workoutData.variants
  const weeklyOrder = workoutData.weeklyOrder

  // find next incomplete variant
  let dayIdx = state.currentDayIndex
  for (let i = dayIdx; i < weeklyOrder.length; i++) {
    const variantName = weeklyOrder[i]
    if (!state.completedVariants.includes(variantName)) {
      return allVariants.find((v) => v.variantName === variantName) || null
    }
  }

  // if all 6 are completed, restart from day 0
  return allVariants.find((v) => v.variantName === weeklyOrder[0]) || null
}

export const getCurrentStep = (): ExerciseOrder | null => {
  const variant = getTodayVariant()
  if (!variant) return null

  const state = getWorkoutState()
  return variant.exerciseOrder[state.currentStepIndex] || null
}

export const advanceStep = () => {
  const state = getWorkoutState()
  const variant = getTodayVariant()
  if (!variant) return

  state.currentStepIndex += 1

  // check if workout is complete
  if (state.currentStepIndex >= variant.exerciseOrder.length) {
    state.workoutInProgress = false
    state.completedVariants.push(variant.variantName)

    // advance to next variant index
    state.currentDayIndex = (state.currentDayIndex + 1) % workoutData.weeklyOrder.length
    state.currentStepIndex = 0
  }

  saveWorkoutState(state)
}

export const undoStep = () => {
  const state = getWorkoutState()
  if (!state.workoutInProgress || state.currentStepIndex <= 0) return

  state.currentStepIndex -= 1
  saveWorkoutState(state)
}

export const startWorkout = () => {
  const state = getWorkoutState()
  state.workoutInProgress = true
  state.currentStepIndex = 0
  saveWorkoutState(state)
}

export const finishWorkout = () => {
  const state = getWorkoutState()
  const variant = getTodayVariant()
  if (variant) {
    state.completedVariants.push(variant.variantName)
  }
  state.workoutInProgress = false
  const workoutData = getData()
  state.currentDayIndex = (state.currentDayIndex + 1) % workoutData.weeklyOrder.length
  state.currentStepIndex = 0
  saveWorkoutState(state)
}

