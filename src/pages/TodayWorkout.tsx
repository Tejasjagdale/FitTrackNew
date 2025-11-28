import React, { useState, useEffect } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { getData } from '../data/dataService'
import type { Variant } from '../data/workoutUtils'
import WorkoutPlayer from '../components/WorkoutPlayer'
import VariantCarousel from '../components/VariantCarousel'

export default function TodayWorkout() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false)

  useEffect(() => {
    const data = getData()
    setVariants(data.variants)
    if (data.variants.length) {
      setSelectedVariant(data.variants[0])
      setCurrentStepIndex(0)
    }
  }, [])

  const handlePrevVariant = () => {
    const newIndex = (currentIndex - 1 + variants.length) % variants.length
    setCurrentIndex(newIndex)
    setSelectedVariant(variants[newIndex])
    setCurrentStepIndex(0)
    setIsWorkoutInProgress(false)
  }

  const handleNextVariant = () => {
    const newIndex = (currentIndex + 1) % variants.length
    setCurrentIndex(newIndex)
    setSelectedVariant(variants[newIndex])
    setCurrentStepIndex(0)
    setIsWorkoutInProgress(false)
  }

  const handleStartWorkout = () => {
    setIsWorkoutInProgress(true)
    setCurrentStepIndex(0)
  }

  const handleStepComplete = (nextIndex: number) => {
    setCurrentStepIndex(nextIndex)
  }

  const handleUndoStep = (prevIndex: number) => {
    setCurrentStepIndex(prevIndex)
  }

  const handleFinishWorkout = () => {
    setIsWorkoutInProgress(false)
    setCurrentStepIndex(0)
  }

  if (!selectedVariant) return <Typography>Loading...</Typography>

  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Choose a Workout
        </Typography>

        {!isWorkoutInProgress ? (
          <VariantCarousel
            variants={variants}
            currentIndex={currentIndex}
            selectedVariant={selectedVariant}
            onPrev={handlePrevVariant}
            onNext={handleNextVariant}
            onStart={handleStartWorkout}
          />
        ) : (
          <WorkoutPlayer
            variant={selectedVariant}
            currentStepIndex={currentStepIndex}
            onStepComplete={handleStepComplete}
            onUndo={handleUndoStep}
            onFinishWorkout={handleFinishWorkout}
          />
        )}
      </Box>
    </Container>
  )
}
