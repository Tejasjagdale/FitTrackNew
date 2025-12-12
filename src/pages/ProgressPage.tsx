// src/pages/ProgressDashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  Grid
} from '@mui/material'

import {
  loadProgressData,
  setProgressData,
  syncProgressToGitHub
} from '../data/progressDataService'

import { isGitHubConfigured } from '../data/githubService'

import {
  ProfileData,
  MeasurementsEntry,
  ProgressDataFile,
  DailyPoint,
  WorkoutLogEntry,
  DailyHealthStatus
} from '../data/progressTypes'

import {
  sortedDates,
  computeBMI,
  getTodayIndia
} from '../data/progressUtils'

import { AddWeightDialog } from '../components/progressComponents/AddWeightDialog'
import { AddMeasurementDialog } from '../components/progressComponents/AddMeasurementDialog'
import AddDailyHealthDialog from '../components/progressComponents/AddDailyHealthDialog'
import { MetricChartCard } from '../components/progressComponents/MetricChartCard'
import { TrendStatsCards } from '../components/progressComponents/TrendStatsCards'
import { GraphSelector } from '../components/progressComponents/GraphSelector'
import WorkoutProgressTracking from '../components/progressComponents/WorkoutProgressTracking'
import ProgressHistoryGrid from '../components/progressComponents/ProgressHistoryGrid'



/* ---------------------------------------
   HELPER
---------------------------------------- */
function daysBetween(d1: Date, d2: Date) {
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ProgressDashboardPage() {
  const [profile, setProfile] = useState<ProfileData>({})
  const [dailyWeight, setDailyWeight] = useState<Record<string, number>>({})
  const [measurements, setMeasurements] =
    useState<Record<string, MeasurementsEntry>>({})
  const [workouts, setWorkouts] = useState<WorkoutLogEntry[]>([])
  const [dailyHealth, setDailyHealth] =
    useState<Record<string, DailyHealthStatus>>({})

  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [editingWeightDate, setEditingWeightDate] = useState<string | undefined>()

  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false)
  const [editingMeasurementDate, setEditingMeasurementDate] =
    useState<string | undefined>()

  const [healthDialogOpen, setHealthDialogOpen] = useState(false)
  const [editingHealthDate, setEditingHealthDate] = useState<string | undefined>()

  const [selectedGraph, setSelectedGraph] = useState('none')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Popup control flags (Weight + Measurement only)
  const [weightPopupShown, setWeightPopupShown] = useState(false)
  const [measurementPopupShown, setMeasurementPopupShown] = useState(false)

  // Health popup should trigger once per page load if needed
  const [healthPopupAttempted, setHealthPopupAttempted] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const hasGitHubToken = isGitHubConfigured()


  /* ---------------------------------------
     LOAD PROGRESS DATA
  ---------------------------------------- */
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const data = (await loadProgressData()) as ProgressDataFile
        if (cancelled) return

        setProfile(data.profile || {})
        setDailyWeight(data.dailyWeight || {})
        setMeasurements(data.measurements || {})
        setWorkouts(data.workouts || [])
        setDailyHealth(data.dailyHealth || {})
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load progress data.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [])



  /* ---------------------------------------
     AUTO POPUPS (IST LOGIC)
  ---------------------------------------- */
  useEffect(() => {
    if (loading) return

    const today = getTodayIndia()
    const hasTodayWeight = dailyWeight[today] !== undefined

    // -------------------------------
    // STEP 1 — Always ask for weight if missing
    // -------------------------------
    if (!hasTodayWeight && !weightPopupShown) {
      setWeightDialogOpen(true)
      setWeightPopupShown(true)
      return
    }

    // -------------------------------
    // STEP 2 — Measurements prompt (once per load)
    // -------------------------------
    if (hasTodayWeight && !measurementPopupShown) {
      const measurementDatesSorted = sortedDates(measurements)
      const lastMeasurementDate =
        measurementDatesSorted[measurementDatesSorted.length - 1]

      if (!lastMeasurementDate) {
        setMeasurementDialogOpen(true)
        setMeasurementPopupShown(true)
        return
      }

      const diff = daysBetween(
        new Date(lastMeasurementDate + 'T00:00:00+05:30'),
        new Date(today + 'T00:00:00+05:30')
      )

      if (diff >= 10) {
        setMeasurementDialogOpen(true)
        setMeasurementPopupShown(true)
        return
      }
    }

    // -------------------------------
    // STEP 3 — Daily Health popup (AFTER 9PM, once per load)
    // -------------------------------
    if (!healthPopupAttempted) {
      const now = new Date()
      const hour = now.getHours()
      const hasHealthToday = dailyHealth[today] !== undefined

      if (hour >= 21 && !hasHealthToday) {
        setHealthDialogOpen(true)
      }

      setHealthPopupAttempted(true)
    }

  }, [
    loading,
    dailyWeight,
    measurements,
    dailyHealth,
    weightPopupShown,
    measurementPopupShown,
    healthPopupAttempted
  ])



  /* ---------------------------------------
     DERIVED VALUES
  ---------------------------------------- */
  const dailyPoints: DailyPoint[] = useMemo(() =>
    sortedDates(dailyWeight).map(date => ({
      date,
      weight: dailyWeight[date],
      bmi: computeBMI(dailyWeight[date], profile.heightCm)
    }))
    , [dailyWeight, profile.heightCm])

  const latestDaily = dailyPoints.at(-1)
  const firstDaily = dailyPoints[0]

  const measurementDates = sortedDates(measurements)
  const sampleMeasurement =
    measurementDates.length ? measurements[measurementDates[0]] : {}

  const measurementKeys = Array.from(
    new Set(
      measurementDates.flatMap(date =>
        Object.keys(measurements[date] || {})
      )
    )
  );



  /* ---------------------------------------
     LOADING STATE
  ---------------------------------------- */

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6">Loading progress data…</Typography>
      </Container>
    )
  }

  if (loadError) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" color="error">Failed to load progress data</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>{loadError}</Typography>
      </Container>
    )
  }



  /* ---------------------------------------
     PAGE RENDER
  ---------------------------------------- */

  return (
    <Container sx={{ py: 4 }}>

      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Body Progress Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Track weight, BMI, measurements, and workout performance trends.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => setWeightDialogOpen(true)}>
            Add Weight
          </Button>

          <Button variant="outlined" onClick={() => setMeasurementDialogOpen(true)}>
            Add Measurements
          </Button>

          <Button variant="outlined" onClick={() => setHealthDialogOpen(true)}>
            Add Daily Health
          </Button>

          {hasGitHubToken && (
            <Button
              variant="outlined"
              disabled={isSyncing}
              onClick={() => {
                setIsSyncing(true)
                setProgressData({
                  profile,
                  dailyWeight,
                  measurements,
                  workouts,
                  dailyHealth
                })
                syncProgressToGitHub(`Update progress - ${new Date().toLocaleString('en-IN')}`)
                  .then(() => setSyncMessage('Synced!'))
                  .catch(err => setSyncError(err.message))
                  .finally(() => setIsSyncing(false))
              }}
            >
              {isSyncing ? 'Syncing…' : 'Sync'}
            </Button>
          )}
        </Stack>
      </Box>



      {/* GRAPH SELECTOR */}
      <GraphSelector
        selectedGraph={selectedGraph}
        onChange={setSelectedGraph}
        measurementKeys={measurementKeys}
      />

      {/* GRAPHS */}
      {selectedGraph !== 'none' && (
        <Box sx={{ mb: 4 }}>

          {/* WEIGHT */}
          {selectedGraph === 'weight' && (
            <MetricChartCard
              title="Weight"
              metricKey="weight"
              data={dailyPoints.map(p => ({ date: p.date, value: p.weight }))}
              goalValue={profile.goalWeight}
            />
          )}

          {/* SEE ALL */}
          {selectedGraph === 'seeAll' && (
            <Grid container spacing={2}>

              {/* Weight */}
              <Grid item xs={12} sm={6} md={4}>
                <MetricChartCard
                  title="Weight"
                  metricKey="weight"
                  data={dailyPoints.map(p => ({ date: p.date, value: p.weight }))}
                  goalValue={profile.goalWeight}
                />
              </Grid>

              {/* ALL MEASUREMENTS */}
              {measurementKeys.map(key => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <MetricChartCard
                    title={key}
                    metricKey={key}
                    data={measurementDates.map(date => ({
                      date,
                      value: measurements[date]?.[key as keyof MeasurementsEntry]
                    }))}
                  />
                </Grid>
              ))}

            </Grid>
          )}

          {/* A SINGLE MEASUREMENT SELECTED */}
          {selectedGraph !== 'weight' &&
            selectedGraph !== 'seeAll' &&
            (
              <MetricChartCard
                title={selectedGraph}
                metricKey={selectedGraph}
                data={measurementDates.map(date => ({
                  date,
                  value: measurements[date]?.[selectedGraph as keyof MeasurementsEntry]
                }))}
              />
            )}
        </Box>
      )}


      {/* SYNC MESSAGE */}
      {(syncMessage || syncError) && (
        <Box sx={{ mb: 2 }}>
          {syncMessage && <Typography color="success.main">{syncMessage}</Typography>}
          {syncError && <Typography color="error.main">{syncError}</Typography>}
        </Box>
      )}



      {/* WORKOUT TRACKING */}
      <WorkoutProgressTracking workouts={workouts} />



      {/* TRENDS CARDS */}
      <TrendStatsCards
        dailyPoints={dailyPoints}
        profile={profile}
        measurementDates={measurementDates}
        onEditLatestWeight={() => {
          setEditingWeightDate(latestDaily?.date)
          setWeightDialogOpen(true)
        }}
        onEditLatestMeasurement={() => {
          setEditingMeasurementDate(measurementDates.at(-1))
          setMeasurementDialogOpen(true)
        }}
      />


      {/* EDITABLE GRID */}
      <ProgressHistoryGrid
        dailyWeight={dailyWeight}
        measurements={measurements}
        workouts={workouts}
        dailyHealth={dailyHealth}
        onUpdateWeight={(date, weight) => {
          setDailyWeight(prev => ({ ...prev, [date]: weight }))
        }}
        onUpdateMeasurement={(date, updated) => {
          setMeasurements(prev => ({ ...prev, [date]: updated }))
        }}
        onUpdateWorkout={(index, updated) => {
          setWorkouts(prev => {
            const arr = [...prev]
            arr[index] = updated
            return arr
          })
        }}
        onUpdateHealth={(date, updated) => {
          setDailyHealth(prev => ({ ...prev, [date]: updated }))
        }}
      />


      {/* DIALOGS */}
      <AddWeightDialog
        open={weightDialogOpen}
        initialDate={editingWeightDate}
        initialWeight={editingWeightDate ? dailyWeight[editingWeightDate] : undefined}
        onClose={() => {
          setWeightDialogOpen(false)
          setEditingWeightDate(undefined)
        }}
        onSave={(date, weight) => {
          setDailyWeight(prev => ({ ...prev, [date]: weight }))
          setWeightDialogOpen(false)
          setEditingWeightDate(undefined)
        }}
      />

      <AddMeasurementDialog
        open={measurementDialogOpen}
        date={editingMeasurementDate}
        initial={editingMeasurementDate ? measurements[editingMeasurementDate] : undefined}
        onClose={() => {
          setMeasurementDialogOpen(false)
          setEditingMeasurementDate(undefined)
        }}
        onSave={(date, data) => {
          setMeasurements(prev => ({ ...prev, [date]: data }))
          setMeasurementDialogOpen(false)
          setEditingMeasurementDate(undefined)
        }}
        profile={profile}
        latestWeight={latestDaily?.weight}
      />

      <AddDailyHealthDialog
        open={healthDialogOpen}
        date={editingHealthDate}
        initial={editingHealthDate ? dailyHealth[editingHealthDate] : undefined}
        onClose={() => {
          setHealthDialogOpen(false)
          setEditingHealthDate(undefined)
        }}
        onSave={(date, data) => {
          setDailyHealth(prev => ({ ...prev, [date]: data }))
          setHealthDialogOpen(false)
          setEditingHealthDate(undefined)
        }}
      />

    </Container>
  )
}
