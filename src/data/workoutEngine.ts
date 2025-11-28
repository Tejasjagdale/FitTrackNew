export interface WorkoutState {
  currentDayIndex: number
  currentStepIndex: number
  workoutInProgress: boolean
}

export const getWorkoutState = (): WorkoutState => {
  const stored = localStorage.getItem('workoutState')
  if (stored) return JSON.parse(stored)

  const initial: WorkoutState = {
    currentDayIndex: 0,
    currentStepIndex: 0,
    workoutInProgress: false
  }

  localStorage.setItem('workoutState', JSON.stringify(initial))
  return initial
}

export const saveWorkoutState = (state: WorkoutState) => {
  localStorage.setItem('workoutState', JSON.stringify(state))
}

// dummy data you replace with real data service
import { getData } from './dataService'

export const getTodayVariant = () => {
  const data = getData()
  const state = getWorkoutState()
  return data.variants[state.currentDayIndex] || null
}

export const getCurrentStep = () => {
  const variant = getTodayVariant()
  if (!variant) return null
  const state = getWorkoutState()
  return variant.exerciseOrder[state.currentStepIndex] || null
}

export const startWorkout = () => {
  const state = getWorkoutState()
  state.workoutInProgress = true
  state.currentStepIndex = 0
  saveWorkoutState(state)
}

export const advanceStep = () => {
  const state = getWorkoutState()
  const variant = getTodayVariant()
  if (!variant) return

  state.currentStepIndex += 1

  if (state.currentStepIndex >= variant.exerciseOrder.length) {
    // workout finished
    state.workoutInProgress = false
    state.currentDayIndex = (state.currentDayIndex + 1)
    state.currentStepIndex = 0
  }

  saveWorkoutState(state)
}

export const undoStep = () => {
  const state = getWorkoutState()

  if (state.currentStepIndex > 0) {
    state.currentStepIndex -= 1
    saveWorkoutState(state)
    return true
  }

  return false // tell UI to go back to carousel
}

export const resetToChooser = () => {
  const state: WorkoutState = {
    currentDayIndex: 0,
    currentStepIndex: 0,
    workoutInProgress: false
  }
  saveWorkoutState(state)
}
