// src/pages/WorkoutPlaylist.tsx
import React, { useState, useEffect } from 'react'
import { Container, Box, Typography } from '@mui/material'

import { loadData, getData } from '../data/dataService'
import type { Variant } from '../data/workoutUtils'

import WorkoutPlayer from '../components/WorkoutPlayer'
import VariantCarousel from '../components/VariantCarousel'

import {
  loadProgressData,
  getProgressData,
  setProgressData,
  syncProgressToGitHub
} from '../data/progressDataService'

export default function WorkoutPlaylist() {
  const [variants, setVariants] = useState<Variant[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -----------------------------
  // Load workout + progress from GitHub
  // -----------------------------
  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)

      try {
        await loadData()
        await loadProgressData()

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
    setWorkoutStartTime(new Date().toISOString())
  }

  const handleStepComplete = (nextIndex: number) => {
    setCurrentStepIndex(nextIndex)
  }

  const handleUndoStep = (prevIndex: number) => {
    setCurrentStepIndex(prevIndex)
  }

  // ------------------------------------------------
  // **IMPORTANT FIX** — Save workout to GitHub
  // ------------------------------------------------
  const handleFinishWorkout = async (completedFully: boolean) => {
    if (!selectedVariant || !workoutStartTime) return

    try {
      const now = new Date()

      const today = now.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Kolkata'
      })
      const progress = getProgressData()
      const log = progress.workouts || []

      log.push({
        date: today,
        startTime: workoutStartTime,
        endTime: now.toISOString(),
        variantId: selectedVariant.id,
        variantName: selectedVariant.variantName,
        completed: completedFully
      })

      const updated = { ...progress, workouts: log }
      setProgressData(updated)

      await syncProgressToGitHub(
        completedFully
          ? 'Workout completed (Playlist)'
          : 'Workout partial (Playlist)'
      )
    } catch (err) {
      console.error(err)
      alert('Failed to save workout.')
    }

    // reset UI
    setIsWorkoutInProgress(false)
    setCurrentStepIndex(0)
    setWorkoutStartTime(null)
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
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
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
            onFinishWorkout={handleFinishWorkout} // FIXED
          />
        )}
      </Box>
    </Container>
  )
}
