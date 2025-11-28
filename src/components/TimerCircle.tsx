// TimerCircle.tsx
import React from 'react'
import { Box, Typography, CircularProgress, useTheme } from '@mui/material'

interface TimerCircleProps {
  timeLeft: number
  totalTime: number
}

export default function TimerCircle({ timeLeft, totalTime }: TimerCircleProps) {
  const theme = useTheme()
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={120}
        thickness={6}
        sx={{
          color: theme.palette.primary.main,
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, fontFamily: 'monospace', color: theme.palette.primary.main }}
        >
          {timeLeft}s
        </Typography>
      </Box>
    </Box>
  )
}
