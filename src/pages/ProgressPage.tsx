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
  DailyPoint
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

export default function ProgressDashboardPage() {
  const [profile, setProfile] = useState<ProfileData>({})
  const [goals, setGoals] = useState<Goals>({})
  const [dailyWeight, setDailyWeight] = useState<Record<string, number>>({})
  const [measurements, setMeasurements] = useState<Record<string, MeasurementsEntry>>({})

  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const [editingWeightDate, setEditingWeightDate] = useState<string | undefined>()
  const [measurementDialogOpen, setMeasurementDialogOpen] = useState(false)
  const [editingMeasurementDate, setEditingMeasurementDate] =
    useState<string | undefined>()
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const [selectedGraph, setSelectedGraph] = useState<string>('none')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [popupInitialized, setPopupInitialized] = useState(false)

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const hasGitHubToken = isGitHubConfigured()

  /* -------------------------------
     Load progress data from GitHub
  --------------------------------*/

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
      } catch (err) {
        if (cancelled) return
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load progress data.'
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [])

  /* -------------------------------
     Derived Data
  --------------------------------*/

  const dailyPoints: DailyPoint[] = useMemo(() => {
    return sortedDates(dailyWeight).map((date) => {
      const w = dailyWeight[date]
      return {
        date,
        weight: w,
        bmi: computeBMI(w, profile.heightCm)
      }
    })
  }, [dailyWeight, profile.heightCm])

  const latestDaily = dailyPoints[dailyPoints.length - 1]
  const firstDaily = dailyPoints[0]

  const measurementDates = useMemo(
    () => sortedDates(measurements),
    [measurements]
  )

  const sampleMeasurement =
    measurementDates.length > 0 ? measurements[measurementDates[0]] : {}

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
    measurementDates.map((date) => ({
      date,
      value: measurements[date]?.[key]
    }))

  /* -------------------------------
     BMI Projection Summary
  --------------------------------*/

  const bmiTrendText = useMemo(() => {
    if (!goals.targetBMI || !profile.heightCm || dailyPoints.length < 2) {
      return 'Log more days to see BMI trend projections.'
    }
    const slope = computeTrendSlope(dailyPoints)
    if (slope === undefined || slope === 0)
      return 'BMI is flat based on recent data.'

    const latest = dailyPoints[dailyPoints.length - 1]
    const latestBMIVal = latest.bmi
    if (latestBMIVal === undefined) return 'Cannot compute BMI trend.'

    const h = profile.heightCm / 100
    const targetBMI = goals.targetBMI
    const targetWeightForBMI = targetBMI * h * h

    const remaining = targetWeightForBMI - latest.weight
    const daysToGoal = remaining / slope
    if (!Number.isFinite(daysToGoal))
      return 'BMI trend unstable; no projection.'

    if (daysToGoal < 0) return 'Trend moving away from target BMI.'

    const now = new Date(latest.date).getTime()
    const etaDate = new Date(now + daysToGoal * 86400000)
    const etaStr = etaDate.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Kolkata'
    })

    const kgPerWeek = slope * 7

    return `At current trend (~${kgPerWeek.toFixed(
      2
    )} kg/week), you may reach BMI ${targetBMI} around ${etaStr}.`
  }, [dailyPoints, goals.targetBMI, profile.heightCm])

  /* -------------------------------
     AUTO POPUP LOGIC (IST-safe)
  --------------------------------*/

  useEffect(() => {
    if (loading || loadError || popupInitialized) return

    const today = getTodayIndia()

    // weight for today missing → ask
    if (!dailyWeight[today]) {
      setEditingWeightDate(undefined)
      setWeightDialogOpen(true)
      setPopupInitialized(true)
      return
    }

    // measurements every 15 days
    const dates = Object.keys(measurements).sort()

    if (dates.length > 0) {
      const lastDate = dates[dates.length - 1]
      const diff =
        (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000

      if (diff >= 15) {
        setEditingMeasurementDate(undefined)
        setMeasurementDialogOpen(true)
      }
    } else {
      setEditingMeasurementDate(undefined)
      setMeasurementDialogOpen(true)
    }

    setPopupInitialized(true)
  }, [loading, loadError, popupInitialized, dailyWeight, measurements])

  /* -------------------------------
     Handlers
  --------------------------------*/

  const openAddWeight = () => {
    setEditingWeightDate(undefined)
    setWeightDialogOpen(true)
  }

  const openEditWeight = () => {
    if (!latestDaily) return
    setEditingWeightDate(latestDaily.date)
    setWeightDialogOpen(true)
  }

  const handleSaveWeight = (date: string, weight: number) => {
    setDailyWeight((prev) => ({
      ...prev,
      [date]: weight
    }))
    setWeightDialogOpen(false)
    setEditingWeightDate(undefined)
  }

  const openAddMeasurement = () => {
    setEditingMeasurementDate(undefined)
    setMeasurementDialogOpen(true)
  }

  const openEditMeasurement = () => {
    if (!measurementDates.length) return
    const lastDate = measurementDates[measurementDates.length - 1]
    setEditingMeasurementDate(lastDate)
    setMeasurementDialogOpen(true)
  }

  const handleSaveMeasurement = (date: string, data: MeasurementsEntry) => {
    setMeasurements((prev) => ({
      ...prev,
      [date]: data
    }))
    setMeasurementDialogOpen(false)
    setEditingMeasurementDate(undefined)
  }

  const handleSaveProfile = (data: ProfileData) => {
    setProfile(data)
  }

  const handleSyncToGitHub = async () => {
    if (!hasGitHubToken) {
      setSyncError('GitHub token not configured.')
      return
    }
    setIsSyncing(true)
    setSyncError(null)
    setSyncMessage(null)

    try {
      setProgressData({
        profile,
        goals,
        dailyWeight,
        measurements
      })
      await syncProgressToGitHub(
        `Update progress data - ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata'
        })}`
      )
      setSyncMessage('Progress data synced to GitHub.')
    } catch (err) {
      setSyncError(
        err instanceof Error ? err.message : 'Failed to sync progress data.'
      )
    } finally {
      setIsSyncing(false)
    }
  }

  /* -------------------------------
     Loading / Error UI
  --------------------------------*/

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
        <Typography variant="h6" sx={{ color: 'error.main', mb: 1 }}>
          Failed to load progress data
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {loadError}
        </Typography>
        <Typography variant="body2">
          Check your GitHub configuration and that <code>progressData.json</code> exists
          in the repo root.
        </Typography>
      </Container>
    )
  }

  const measurementKeys = Object.keys(sampleMeasurement || {})

  /* -------------------------------------------------
     Render
  ---------------------------------------------------*/

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
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
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Track daily weight & BMI, plus full measurements every ~15 days. Data is
            loaded from progressData.json in your GitHub repo.
          </Typography>
          {profile.name && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {profile.name}
              {profile.age ? ` • ${profile.age} yrs` : ''}
              {profile.heightCm ? ` • ${profile.heightCm} cm` : ''}
              {profile.gender ? ` • ${profile.gender}` : ''}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Edit Profile">
            <IconButton onClick={() => setProfileDialogOpen(true)}>
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddWeight}
          >
            Add Weight
          </Button>
          <Button variant="outlined" onClick={openAddMeasurement}>
            Add Measurements
          </Button>

          {hasGitHubToken && (
            <Button
              variant="outlined"
              onClick={handleSyncToGitHub}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing…' : 'Sync to GitHub'}
            </Button>
          )}
        </Stack>
      </Box>

      {(syncMessage || syncError) && (
        <Box sx={{ mb: 2 }}>
          {syncMessage && (
            <Typography variant="body2" sx={{ color: 'success.main' }}>
              {syncMessage}
            </Typography>
          )}
          {syncError && (
            <Typography variant="body2" sx={{ color: 'error.main' }}>
              {syncError}
            </Typography>
          )}
        </Box>
      )}

      {/* Top stats cards */}
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
        onEditLatestWeight={openEditWeight}
        onEditLatestMeasurement={openEditMeasurement}
      />

      {/* Graph selector */}
      <GraphSelector
        selectedGraph={selectedGraph}
        onChange={setSelectedGraph}
        measurementKeys={measurementKeys}
      />

      {/* Graph display */}
      {selectedGraph !== 'none' && (
        <Box sx={{ mb: 4 }}>
          {selectedGraph === 'weight' && (
            <MetricChartCard
              title="Weight"
              data={dailyPoints.map((p) => ({
                date: p.date,
                value: p.weight
              }))}
              goalValue={targetWeight}
            />
          )}

          {selectedGraph === 'bmi' && (
            <MetricChartCard
              title="BMI"
              data={dailyPoints.map((p) => ({
                date: p.date,
                value: p.bmi
              }))}
              goalValue={goals.targetBMI}
            />
          )}

          {selectedGraph === 'seeAll' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <MetricChartCard
                  title="Weight"
                  data={dailyPoints.map((p) => ({
                    date: p.date,
                    value: p.weight
                  }))}
                  goalValue={targetWeight}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <MetricChartCard
                  title="BMI"
                  data={dailyPoints.map((p) => ({
                    date: p.date,
                    value: p.bmi
                  }))}
                  goalValue={goals.targetBMI}
                />
              </Grid>

              {measurementKeys.map((key) => (
                <Grid key={key} item xs={12} sm={6} md={4}>
                  <MetricChartCard
                    title={key}
                    data={buildMetricData(key as keyof MeasurementsEntry)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {selectedGraph !== 'weight' &&
            selectedGraph !== 'bmi' &&
            selectedGraph !== 'seeAll' && (
              <MetricChartCard
                title={selectedGraph}
                data={buildMetricData(selectedGraph as keyof MeasurementsEntry)}
              />
            )}
        </Box>
      )}

      {/* Weight dialog */}
      <AddWeightDialog
        open={weightDialogOpen}
        initialDate={editingWeightDate}
        initialWeight={
          editingWeightDate ? dailyWeight[editingWeightDate] : undefined
        }
        onClose={() => {
          setWeightDialogOpen(false)
          setEditingWeightDate(undefined)
        }}
        onSave={handleSaveWeight}
      />

      {/* Measurements dialog */}
      <AddMeasurementDialog
        open={measurementDialogOpen}
        date={editingMeasurementDate}
        initial={
          editingMeasurementDate ? measurements[editingMeasurementDate] : undefined
        }
        onClose={() => {
          setMeasurementDialogOpen(false)
          setEditingMeasurementDate(undefined)
        }}
        onSave={handleSaveMeasurement}
      />

      {/* Profile dialog */}
      <ProfileDialog
        open={profileDialogOpen}
        initial={profile}
        onClose={() => setProfileDialogOpen(false)}
        onSave={handleSaveProfile}
      />
    </Container>
  )
}
