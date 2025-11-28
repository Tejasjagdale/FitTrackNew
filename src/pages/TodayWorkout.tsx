// src/pages/TodayWorkout.tsx
import React, { useState, useEffect } from 'react'
import { Container, Box, Typography } from '@mui/material'
import { loadData, getData } from '../data/dataService'
import type { Variant } from '../data/workoutUtils'
import WorkoutPlayer from '../components/WorkoutPlayer'
import VariantCarousel from '../components/VariantCarousel'

export default function TodayWorkout() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------
  // Load workout data from GitHub
  // -----------------------------
  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        await loadData() // WAIT for GitHub
        if (cancelled) return

        const data = getData()
        setVariants(data.variants || [])

        if (data.variants?.length > 0) {
          setSelectedVariant(data.variants[0])
          setCurrentStepIndex(0)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load workout data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  // -----------------------------
  // Navigation handlers
  // -----------------------------
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

  // -----------------------------
  // Loading & Error states
  // -----------------------------
  if (loading) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading workout data…</Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Failed to load workouts
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Container>
    )
  }

  if (!selectedVariant) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>No variants found.</Typography>
        </Box>
      </Container>
    )
  }

  // -----------------------------
  // Main UI
  // -----------------------------
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
