import React, { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
  Stack,
  useTheme
} from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  getTodayVariant,
  getCurrentStep,
  getWorkoutState,
  startWorkout,
  advanceStep,
  undoStep,
  finishWorkout
} from '../data/workoutUtils'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'

export default function TodayWorkout() {
  const theme = useTheme()
  const [variant, setVariant] = useState<Variant | null>(null)
  const [currentStep, setCurrentStep] = useState<ExerciseOrder | null>(null)
  const [state, setState] = useState(getWorkoutState())
  const [timeLeft, setTimeLeft] = useState(0)
  const [isResting, setIsResting] = useState(false)

  // Update states
  useEffect(() => {
    setVariant(getTodayVariant())
    setCurrentStep(getCurrentStep())
    setState(getWorkoutState())
  }, [])

  // Timer logic for rest periods
  useEffect(() => {
    if (!isResting || timeLeft <= 0) return

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [isResting, timeLeft])

  const handleStartWorkout = () => {
    startWorkout()
    const newState = getWorkoutState()
    setState(newState)
    setCurrentStep(getCurrentStep())
  }

  const handleCompleteSet = () => {
    if (currentStep) {
      setIsResting(true)
      setTimeLeft(currentStep.restSeconds)
    }
  }

  const handleNext = () => {
    advanceStep()
    const newState = getWorkoutState()
    const nextStep = getCurrentStep()

    setState(newState)
    setCurrentStep(nextStep)
    setIsResting(false)
    setTimeLeft(0)

    // if workout complete, refresh
    if (!newState.workoutInProgress) {
      setVariant(getTodayVariant())
    }
  }

  const handleUndo = () => {
    undoStep()
    const newState = getWorkoutState()
    setState(newState)
    setCurrentStep(getCurrentStep())
    setIsResting(false)
    setTimeLeft(0)
  }

  const handleFinish = () => {
    finishWorkout()
    const newState = getWorkoutState()
    setState(newState)
    setVariant(getTodayVariant())
    setCurrentStep(null)
    setIsResting(false)
    setTimeLeft(0)
  }

  if (!variant) return <Typography>Loading...</Typography>

  const isWorkoutDone = !state.workoutInProgress && currentStep === null
  const progress = state.workoutInProgress ? ((state.currentStepIndex + 1) / variant.exerciseOrder.length) * 100 : 0

  return (
    <Container>
      <Box sx={{ py: 4 }}>
        {/* Workout Plan Card (pre-start) */}
        {!state.workoutInProgress && (
          <Card className="glass" sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <FitnessCenterIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {variant.variantName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {variant.exercisesList.length} exercises • {variant.exerciseOrder.length} sets total
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3, flexWrap: 'wrap' }}>
              {variant.exercisesList.map((ex) => (
                <Chip key={ex.name} label={`${ex.name} (${ex.sets}x)`} color="primary" variant="outlined" />
              ))}
            </Stack>

            {!isWorkoutDone && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartWorkout}
                sx={{ borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
              >
                Let's Start
              </Button>
            )}

            {isWorkoutDone && (
              <Typography variant="body1" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                ✓ Workout Complete! Next variant scheduled for tomorrow.
              </Typography>
            )}
          </Card>
        )}

        {/* Active Exercise Card */}
        {state.workoutInProgress && currentStep && !isResting && (
          <Card className="glass" sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ mb: 3, borderRadius: 2, height: 6 }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Step {state.currentStepIndex + 1} of {variant.exerciseOrder.length}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
              {currentStep.name}
            </Typography>

            <Stack spacing={2} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Chip label={`Set ${currentStep.set}`} color="primary" variant="filled" />
                <Chip label={`${currentStep.reps} reps`} variant="outlined" />
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={handleCompleteSet}
              sx={{ borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
            >
              Set Complete
            </Button>

            {state.currentStepIndex > 0 && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleUndo}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Undo
              </Button>
            )}
          </Card>
        )}

        {/* Rest Timer Card */}
        {state.workoutInProgress && isResting && timeLeft > 0 && currentStep && (
          <Card className="glass" sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Rest before next set
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 4,
                color: theme.palette.primary.main,
                fontFamily: 'monospace'
              }}
            >
              {timeLeft}s
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(1 - timeLeft / currentStep.restSeconds) * 100}
              sx={{ mb: 3, borderRadius: 2, height: 6 }}
            />

            <Button
              variant="outlined"
              onClick={handleNext}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Skip Rest
            </Button>

            {state.currentStepIndex > 0 && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ArrowBackIcon />}
                onClick={handleUndo}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Undo
              </Button>
            )}
          </Card>
        )}

        {/* Finish Button */}
        {state.workoutInProgress && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {currentStep && !isResting && <div />}
            {isResting && timeLeft === 0 && (
              <Button variant="contained" onClick={handleNext} sx={{ borderRadius: 2 }}>
                Next Set
              </Button>
            )}
            <Button variant="outlined" color="error" onClick={handleFinish} sx={{ borderRadius: 2 }}>
              Finish Workout
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  )
}
