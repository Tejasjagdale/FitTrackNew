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
  IconButton,
  useTheme
} from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  getData,
} from '../data/dataService'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'

export default function TodayWorkout() {
  const theme = useTheme()
  const [variants, setVariants] = useState<Variant[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false)
  const [currentStep, setCurrentStep] = useState<ExerciseOrder | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isResting, setIsResting] = useState(false)

  useEffect(() => {
    const data = getData()
    setVariants(data.variants)
    if (data.variants.length) {
      setSelectedVariant(data.variants[0])
      setCurrentStepIndex(0)
      setCurrentStep(data.variants[0].exerciseOrder[0] || null)
    }
  }, [])

  // Timer logic for rest
  useEffect(() => {
    if (!isResting || timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [isResting, timeLeft])

  // Carousel navigation
  const handlePrevVariant = () => {
    const newIndex = (currentIndex - 1 + variants.length) % variants.length
    setCurrentIndex(newIndex)
    setSelectedVariant(variants[newIndex])
    setCurrentStepIndex(0)
    setCurrentStep(variants[newIndex].exerciseOrder[0] || null)
    setIsWorkoutInProgress(false)
    setIsResting(false)
    setTimeLeft(0)
  }

  const handleNextVariant = () => {
    const newIndex = (currentIndex + 1) % variants.length
    setCurrentIndex(newIndex)
    setSelectedVariant(variants[newIndex])
    setCurrentStepIndex(0)
    setCurrentStep(variants[newIndex].exerciseOrder[0] || null)
    setIsWorkoutInProgress(false)
    setIsResting(false)
    setTimeLeft(0)
  }

  // Start the workout
  const handleStartWorkout = () => {
    setIsWorkoutInProgress(true)
    setCurrentStepIndex(0)
    if (selectedVariant) {
      setCurrentStep(selectedVariant.exerciseOrder[0] || null)
    }
  }

  const handleCompleteSet = () => {
    if (currentStep) {
      setIsResting(true)
      setTimeLeft(currentStep.restSeconds)
    }
  }

  const handleNextStep = () => {
    if (!selectedVariant) return
    const nextIndex = currentStepIndex + 1
    if (nextIndex < selectedVariant.exerciseOrder.length) {
      setCurrentStepIndex(nextIndex)
      setCurrentStep(selectedVariant.exerciseOrder[nextIndex])
    } else {
      // Workout complete
      setIsWorkoutInProgress(false)
      setCurrentStep(null)
      setCurrentStepIndex(0)
    }
    setIsResting(false)
    setTimeLeft(0)
  }

  const handleUndoStep = () => {
    if (currentStepIndex <= 0) return
    const prevIndex = currentStepIndex - 1
    setCurrentStepIndex(prevIndex)
    if (selectedVariant) setCurrentStep(selectedVariant.exerciseOrder[prevIndex])
    setIsResting(false)
    setTimeLeft(0)
  }

  if (!selectedVariant) return <Typography>Loading variants...</Typography>

  // derive exercises list for display
  const exercisesList = selectedVariant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  const progress = isWorkoutInProgress && currentStep
    ? ((currentStepIndex + 1) / selectedVariant.exerciseOrder.length) * 100
    : 0

  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Choose a Workout
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <IconButton onClick={handlePrevVariant}><ArrowBackIosIcon /></IconButton>

          <Card sx={{ p: 4, mx: 2, minWidth: 300, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {selectedVariant.variantName}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {exercisesList.length} exercises • {selectedVariant.exerciseOrder.length} sets total
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
              {exercisesList.map((ex) => (
                <Chip key={ex.name} label={`${ex.name} (${ex.sets}x)`} color="primary" variant="outlined" />
              ))}
            </Stack>

            {!isWorkoutInProgress && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartWorkout}
                sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
              >
                Start This Workout
              </Button>
            )}
          </Card>

          <IconButton onClick={handleNextVariant}><ArrowForwardIosIcon /></IconButton>
        </Box>

        {/* Active Exercise Card */}
        {isWorkoutInProgress && currentStep && !isResting && (
          <Card sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, borderRadius: 2, height: 6 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Step {currentStepIndex + 1} of {selectedVariant.exerciseOrder.length}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
              {currentStep.name}
            </Typography>

            <Stack spacing={2} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Chip label={`Set ${currentStep.set}`} color="primary" variant="filled" />
                <Chip label={`${currentStep.reps} reps`} variant="outlined" />
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={handleCompleteSet}
              sx={{ borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600, mb: 1 }}
            >
              Complete Set
            </Button>

            {currentStepIndex > 0 && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleUndoStep}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Undo
              </Button>
            )}
          </Card>
        )}

        {/* Rest Timer Card */}
        {isWorkoutInProgress && isResting && timeLeft > 0 && currentStep && (
          <Card sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              Rest before next set
            </Typography>

            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main, fontFamily: 'monospace' }}>
              {timeLeft}s
            </Typography>

            <LinearProgress
              variant="determinate"
              value={(1 - timeLeft / currentStep.restSeconds) * 100}
              sx={{ mb: 2, borderRadius: 2, height: 6 }}
            />

            <Button variant="outlined" onClick={handleNextStep} sx={{ borderRadius: 2, textTransform: 'none', mb: 1 }}>
              Skip Rest
            </Button>

            {currentStepIndex > 0 && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<ArrowBackIcon />}
                onClick={handleUndoStep}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Undo
              </Button>
            )}
          </Card>
        )}
      </Box>
    </Container>
  )
}
