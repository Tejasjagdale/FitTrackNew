// src/pages/ProgressDashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

import {
  loadProgressData,
  setProgressData,
  syncProgressToGitHub
} from '../data/progressDataService'
import { isGitHubConfigured } from '../data/githubService'

import {
  ProfileData,
  Goals,
  MeasurementsEntry,
  ProgressDataFile,
  DailyPoint,
  WorkoutLogEntry
} from '../data/progressTypes'

import {
  getTodayIndia,
  sortedDates,
  computeBMI,
  computeTrendSlope
} from '../data/progressUtils'

import { AddWeightDialog } from '../components/progressComponents/AddWeightDialog'
import { AddMeasurementDialog } from '../components/progressComponents/AddMeasurementDialog'
import { ProfileDialog } from '../components/progressComponents/ProfileDialog'
import { MetricChartCard } from '../components/progressComponents/MetricChartCard'
import { TrendStatsCards } from '../components/progressComponents/TrendStatsCards'
import { GraphSelector } from '../components/progressComponents/GraphSelector'

// ***** YOUR FINAL COMPONENT (NO CHANGES MADE) *****
import WorkoutProgressTracking from '../components/progressComponents/WorkoutProgressTracking'

export default function ProgressDashboardPage() {
  const [profile, setProfile] = useState<ProfileData>({})
  const [goals, setGoals] = useState<Goals>({})
  const [dailyWeight, setDailyWeight] = useState<Record<string, number>>({})
  const [measurements, setMeasurements] = useState<Record<string, MeasurementsEntry>>({})
  const [workouts, setWorkouts] = useState<WorkoutLogEntry[]>([])

  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [editingWeightDate, setEditingWeightDate] = useState<string | undefined>()
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false)
  const [editingMeasurementDate, setEditingMeasurementDate] = useState<string | undefined>()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const [selectedGraph, setSelectedGraph] = useState<string>('none')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [popupInitialized, setPopupInitialized] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const hasGitHubToken = isGitHubConfigured()

  // Load progress data
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const data = (await loadProgressData()) as ProgressDataFile
        if (cancelled) return
        setProfile(data.profile || {})
        setGoals(data.goals || {})
        setDailyWeight(data.dailyWeight || {})
        setMeasurements(data.measurements || {})
        setWorkouts(data.workouts || []) // SUPPORT BOTH
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

  // Derived Values
  const dailyPoints: DailyPoint[] = useMemo(() => {
    return sortedDates(dailyWeight).map(date => ({
      date,
      weight: dailyWeight[date],
      bmi: computeBMI(dailyWeight[date], profile.heightCm)
    }))
  }, [dailyWeight, profile.heightCm])

  const latestDaily = dailyPoints[dailyPoints.length - 1]
  const firstDaily = dailyPoints[0]

  const measurementDates = useMemo(() => sortedDates(measurements), [measurements])
  const sampleMeasurement =
    measurementDates.length ? measurements[measurementDates[0]] : {}

  const heightM = profile.heightCm ? profile.heightCm / 100 : undefined

  const targetWeight = useMemo(() => {
    if (!goals.targetBMI || !profile.heightCm) return undefined
    const h = profile.heightCm / 100
    return goals.targetBMI * h * h
  }, [goals.targetBMI, profile.heightCm])

  const latestBMI =
    latestDaily && heightM ? latestDaily.weight / (heightM * heightM) : undefined

  const weightChange =
    latestDaily && firstDaily ? latestDaily.weight - firstDaily.weight : undefined

  const bmiChange =
    latestDaily?.bmi !== undefined && firstDaily?.bmi !== undefined
      ? latestDaily.bmi - firstDaily.bmi
      : undefined

  const buildMetricData = (key: keyof MeasurementsEntry) =>
    measurementDates.map(date => ({
      date,
      value: measurements[date]?.[key]
    }))

  const bmiTrendText = useMemo(() => {
    if (!goals.targetBMI || !profile.heightCm || dailyPoints.length < 2)
      return 'Log more days to see BMI trend projections.'

    const slope = computeTrendSlope(dailyPoints)
    if (!slope) return 'BMI is flat based on recent data.'

    const latest = dailyPoints[dailyPoints.length - 1]
    const h = profile.heightCm / 100
    const targetW = goals.targetBMI * h * h
    const remaining = targetW - latest.weight
    const daysToGoal = remaining / slope

    if (!Number.isFinite(daysToGoal)) return 'BMI trend unstable.'
    if (daysToGoal < 0) return 'Trend moving away from target BMI.'

    const eta = new Date(new Date(latest.date).getTime() + daysToGoal * 86400000)
    const etaStr = eta.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

    return `At current trend, you may reach BMI ${goals.targetBMI} around ${etaStr}.`
  }, [dailyPoints, goals.targetBMI, profile.heightCm])

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

  const measurementKeys = Object.keys(sampleMeasurement || {})

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
          <Tooltip title="Edit Profile">
            <IconButton onClick={() => setProfileDialogOpen(true)}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setWeightDialogOpen(true)}>
            Add Weight
          </Button>

          <Button variant="outlined" onClick={() => setMeasurementDialogOpen(true)}>
            Add Measurements
          </Button>

          {hasGitHubToken && (
            <Button
              variant="outlined"
              onClick={() => {
                setIsSyncing(true)
                setProgressData({ profile, goals, dailyWeight, measurements, workoutLog: workouts })
                syncProgressToGitHub(`Update progress - ${new Date().toLocaleString('en-IN')}`)
                  .then(() => setSyncMessage('Synced!'))
                  .catch(err => setSyncError(err.message || 'Sync failed'))
                  .finally(() => setIsSyncing(false))
              }}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing…' : 'Sync'}
            </Button>
          )}
        </Stack>
      </Box>

      {(syncMessage || syncError) && (
        <Box sx={{ mb: 2 }}>
          {syncMessage && <Typography color="success.main">{syncMessage}</Typography>}
          {syncError && <Typography color="error.main">{syncError}</Typography>}
        </Box>
      )}

      {/* 🚀 YOUR FINAL TRACKING COMPONENT */}
      <WorkoutProgressTracking workoutLog={workouts} />

      {/* STATS CARDS */}
      <TrendStatsCards
        latestDaily={latestDaily}
        firstDaily={firstDaily}
        latestBMI={latestBMI}
        weightChange={weightChange}
        bmiChange={bmiChange}
        targetWeight={targetWeight}
        goals={goals}
        profile={profile}
        measurementDates={measurementDates}
        bmiTrendText={bmiTrendText}
        onEditLatestWeight={() => {
          setEditingWeightDate(latestDaily?.date)
          setWeightDialogOpen(true)
        }}
        onEditLatestMeasurement={() => {
          setEditingMeasurementDate(measurementDates[measurementDates.length - 1])
          setMeasurementDialogOpen(true)
        }}
      />

      <GraphSelector
        selectedGraph={selectedGraph}
        onChange={setSelectedGraph}
        measurementKeys={measurementKeys}
      />

      {selectedGraph !== 'none' && (
        <Box sx={{ mb: 4 }}>
          {selectedGraph === 'weight' && (
            <MetricChartCard
              title="Weight"
              data={dailyPoints.map(p => ({ date: p.date, value: p.weight }))}
              goalValue={targetWeight}
            />
          )}

          {selectedGraph === 'bmi' && (
            <MetricChartCard
              title="BMI"
              data={dailyPoints.map(p => ({ date: p.date, value: p.bmi }))}
              goalValue={goals.targetBMI}
            />
          )}

          {selectedGraph === 'seeAll' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <MetricChartCard
                  title="Weight"
                  data={dailyPoints.map(p => ({ date: p.date, value: p.weight }))}
                  goalValue={targetWeight}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <MetricChartCard
                  title="BMI"
                  data={dailyPoints.map(p => ({ date: p.date, value: p.bmi }))}
                  goalValue={goals.targetBMI}
                />
              </Grid>

              {measurementKeys?.map(key => (
                <Grid key={key} item xs={12} sm={6} md={4}>
                  <MetricChartCard
                    title={key}
                    data={measurementDates?.map(date => ({
                      date,
                      value: measurements[date]?.[key as keyof MeasurementsEntry]
                    }))}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Single measurement chart */}
          {selectedGraph !== 'weight' &&
            selectedGraph !== 'bmi' &&
            selectedGraph !== 'seeAll' && (
              <MetricChartCard
                title={selectedGraph}
                data={measurementDates.map(date => ({
                  date,
                  value: measurements[date]?.[selectedGraph as keyof MeasurementsEntry]
                }))}
              />
            )}
        </Box>
      )}

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
        }}
      />

      <ProfileDialog
        open={profileDialogOpen}
        initial={profile}
        onClose={() => setProfileDialogOpen(false)}
        onSave={setProfile}
      />
    </Container>
  )
}
