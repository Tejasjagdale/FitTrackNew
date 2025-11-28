// src/components/progress/TrendStatsCards.tsx
import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Tooltip,
  IconButton
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { Goals, ProfileData, DailyPoint } from '../../data/progressTypes'
import { safeNum } from '../../data/progressUtils'

interface TrendStatsCardsProps {
  latestDaily?: DailyPoint
  firstDaily?: DailyPoint
  latestBMI?: number
  weightChange?: number
  bmiChange?: number
  targetWeight?: number
  goals: Goals
  profile: ProfileData
  measurementDates: string[]
  bmiTrendText: string
  onEditLatestWeight: () => void
  onEditLatestMeasurement: () => void
}

export function TrendStatsCards({
  latestDaily,
  firstDaily,
  latestBMI,
  weightChange,
  bmiChange,
  targetWeight,
  goals,
  profile,
  measurementDates,
  bmiTrendText,
  onEditLatestWeight,
  onEditLatestMeasurement
}: TrendStatsCardsProps) {
  // helper for green = positive, red = negative, gray = zero/no data
  const colorFor = (val?: number) => {
    if (val === undefined) return 'text.secondary'
    if (val > 0) return 'success.main'
    if (val < 0) return 'error.main'
    return 'text.secondary'
  }

  const diffFromTarget =
    latestDaily?.weight !== undefined && targetWeight !== undefined
      ? Number((latestDaily.weight - targetWeight).toFixed(1))
      : undefined

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Weight */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Weight
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {safeNum(latestDaily?.weight)} kg
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    color: colorFor(weightChange)
                  }}
                >
                  {weightChange !== undefined
                    ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(
                        1
                      )} kg since start`
                    : 'Not enough data'}
                </Typography>
              </Box>

              {latestDaily && (
                <Tooltip title="Edit latest weight">
                  <IconButton size="small" onClick={onEditLatestWeight}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* BMI */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              BMI
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {safeNum(latestBMI)}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                color: colorFor(bmiChange)
              }}
            >
              {bmiChange !== undefined
                ? `${bmiChange > 0 ? '+' : ''}${bmiChange.toFixed(
                    1
                  )} BMI since start`
                : 'Not enough data'}
            </Typography>

            {goals.targetBMI !== undefined && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Target BMI: {goals.targetBMI}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Goal Weight */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Goal Weight (from BMI)
            </Typography>

            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {safeNum(targetWeight)} kg
            </Typography>

            {diffFromTarget !== undefined && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: colorFor(diffFromTarget * -1) // if you are UNDER target = good = green
                }}
              >
                Diff: {diffFromTarget > 0 ? '+' : ''}
                {diffFromTarget} kg from target
              </Typography>
            )}

            {profile.heightCm && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Height: {profile.heightCm} cm
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* BMI Trend */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography
              variant="subtitle2"
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              BMI Trend Projection
            </Typography>

            <Typography variant="body2">{bmiTrendText}</Typography>

            {measurementDates.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Latest measurement: {measurementDates[measurementDates.length - 1]}
                </Typography>

                <Tooltip title="Edit latest measurements">
                  <IconButton
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={onEditLatestMeasurement}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
