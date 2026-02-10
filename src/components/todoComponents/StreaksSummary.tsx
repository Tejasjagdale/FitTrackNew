import React from 'react'
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Paper } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { Task } from '../../types/todoModels'

interface Props {
  tasks: Task[]
}

function toDayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function StreaksSummary({ tasks }: Props) {
  // Compute completed dates set
  const completedDates = new Set<string>()
  tasks.forEach(t => {
    if (t.status === 'completed' && t.lastCompleted) {
      const d = new Date(t.lastCompleted)
      completedDates.add(toDayKey(d))
    }
  })

  // current streak: count consecutive days up to today
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (completedDates.has(toDayKey(d))) streak++
    else break
  }

  // best streak (simple scan)
  let best = 0
  let running = 0
  const keys = Array.from(completedDates).sort()
  // naive approach: iterate days and find runs
  if (keys.length) {
    const dayNums = new Set(keys)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - (365 - i))
      const key = toDayKey(d)
      if (dayNums.has(key)) {
        running++
        best = Math.max(best, running)
      } else {
        running = 0
      }
    }
  }

  const streakPercentage = best > 0 ? Math.round((streak / best) * 100) : 0

  return (
    <Card 
      sx={{ 
        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.04) 0%, rgba(255, 87, 34, 0.04) 100%)',
        border: '1px solid rgba(255, 152, 0, 0.12)',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <LocalFireDepartmentIcon sx={{ color: '#ff9800', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Your Streaks
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {/* Current Streak */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                Current Streak
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff9800', letterSpacing: '0.5px' }}>
                {streak}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.8rem' }}>
              {streak === 0 ? 'Start a new streak today' : streak === 1 ? 'Just started!' : 'Keep it going!'}
            </Typography>
          </Box>

          {/* Best Streak */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                Best Streak
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ff5722', letterSpacing: '0.5px' }}>
                {best}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.8rem' }}>
              Personal record
            </Typography>
          </Box>

          {/* Progress */}
          {best > 0 && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  Progress to Best
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#ff9800', fontSize: '0.85rem' }}>
                  {streakPercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={streakPercentage}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 100%)',
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
