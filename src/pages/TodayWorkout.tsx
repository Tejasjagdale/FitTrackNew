// src/pages/TodayWorkout.tsx
import React, { useEffect, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material'

import {
  loadData as loadWorkoutData,
  getData as getWorkoutData
} from '../data/dataService'

import {
  loadProgressData,
  getProgressData,
  setProgressData,
  syncProgressToGitHub
} from '../data/progressDataService'

import type { Variant } from '../data/workoutUtils'
import WorkoutPlayer from '../components/WorkoutPlayer'
import TodayWorkoutCard from '../components/TodayWorkoutCard'

export default function TodayWorkout() {
  const [loading, setLoading] = useState(true)
  const [workoutVariants, setWorkoutVariants] = useState<Variant[]>([])
  const [todayVariant, setTodayVariant] = useState<Variant | null>(null)
  const [alreadyDoneToday, setAlreadyDoneToday] = useState(false)

  const [isWorkoutInProgress, setIsWorkoutInProgress] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const [error, setError] = useState<string | null>(null)

  const todayDate = new Date().toISOString().slice(0, 10)

  /* --------------------------------------------
     Load workout + progress data from GitHub
  ---------------------------------------------*/
  useEffect(() => {
    async function run() {
      try {
        setLoading(true)

        // Load workouts + progress
        await loadWorkoutData()
        await loadProgressData()

        const workoutJSON = getWorkoutData()
        const progressJSON = getProgressData()

        const variants: Variant[] = workoutJSON.variants || []
        setWorkoutVariants(variants)

        // Did we already do a workout today?
        const history = progressJSON.workouts || []
        const todayEntry = history.find((h: any) => h.date === todayDate)
        setAlreadyDoneToday(Boolean(todayEntry))

        if (!variants.length) {
          setError('No workout variants found.')
          return
        }

        // Recommend next variant (simple rotation)
        const lastWorkout = history.length ? history[history.length - 1] : null
        let recommended: Variant

        if (!lastWorkout) {
          recommended = variants[0]
        } else {
          const lastIndex = variants.findIndex(
            v => v.id === lastWorkout.variantId
          )
          recommended = variants[(lastIndex + 1) % variants.length]
        }

        setTodayVariant(recommended)
      } catch (err: any) {
        setError(err.message || 'Failed to load workout.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [])

  /* --------------------------------------------
     Workout Controls
  ---------------------------------------------*/
  const handleStartWorkout = () => {
    setIsWorkoutInProgress(true)
    setCurrentStepIndex(0)
  }

  const handleStepComplete = (nextIndex: number) =>
    setCurrentStepIndex(nextIndex)

  const handleUndoStep = (prevIndex: number) => setCurrentStepIndex(prevIndex)

  /* --------------------------------------------
     Save workout (partial = false, full = true)
  ---------------------------------------------*/
  const saveWorkoutToHistory = async (completed: boolean) => {
    if (!todayVariant) return

    try {
      const progressJSON = getProgressData()
      const history = progressJSON.workouts || []

      // Remove older entry for today
      const filtered = history.filter((h: any) => h.date !== todayDate)

      filtered.push({
        date: todayDate,
        timestamp: new Date().toISOString(),
        variantId: todayVariant.id,
        variantName: todayVariant.variantName,
        completed
      })

      const newProgress = { ...progressJSON, workouts: filtered }

      setProgressData(newProgress)
      await syncProgressToGitHub(
        completed ? 'Workout completed' : 'Workout partially completed'
      )

      setAlreadyDoneToday(true)
      setIsWorkoutInProgress(false)
      setCurrentStepIndex(0)
    } catch (err) {
      alert('Failed to sync workout.')
    }
  }

  const handleFinishWorkout = async (completedFully: boolean) => {
    await saveWorkoutToHistory(completedFully)
  }

  /* --------------------------------------------
     Render
  ---------------------------------------------*/
  if (loading) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading today’s workout…</Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    )
  }

  if (!todayVariant) {
    return (
      <Container>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography>No variant available.</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container>
      <Box sx={{ py: 4, textAlign: 'center' }}>
        {!alreadyDoneToday ? (
          <>
            {!isWorkoutInProgress ? (
              <TodayWorkoutCard
                variant={todayVariant}
                onStart={handleStartWorkout}
              />
            ) : (
              <WorkoutPlayer
                variant={todayVariant}
                currentStepIndex={currentStepIndex}
                onStepComplete={handleStepComplete}
                onUndo={handleUndoStep}
                onFinishWorkout={(fullyDone: boolean) =>
                  handleFinishWorkout(fullyDone)
                }
              />
            )}
          </>
        ) : (
          <Card sx={{ maxWidth: 450, mx: 'auto', p: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Workout Complete
              </Typography>
              <Typography sx={{ mb: 2 }}>
                You’ve already finished today’s workout.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  )
}
