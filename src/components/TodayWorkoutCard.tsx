// src/components/TodayWorkoutCard.tsx
import React from 'react'
import {
  Card,
  Chip,
  Stack,
  Typography,
  Button,
  Box
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import type { Variant } from '../data/workoutUtils'

interface Props {
  variant: Variant
  onStart: () => void
}

export default function TodayWorkoutCard({ variant, onStart }: Props) {
  const exercisesList = variant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  const uniqueEquipment = Array.from(
    new Set(variant.exerciseOrder.flatMap((ex) => ex.equipment))
  )

  return (
    <Card
      sx={{
        mx: 'auto',
        maxWidth: 460,
        borderRadius: 3,
        overflow: 'hidden',
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        transition: 'all 0.35s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 18px 55px rgba(0,0,0,0.28)'
        }
      }}
    >
      {/* Accent Header */}
      <Box
        sx={{
          height: 6,
          width: '100%',
          background:
            'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)'
        }}
      />

      <Box sx={{ p: 3.5 }}>
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 2,
            letterSpacing: '-0.3px'
          }}
        >
          {variant.variantName}
        </Typography>

        {/* Equipment Panel */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            mb: 2.5,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: 'text.secondary'
            }}
          >
            Equipment
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
            {uniqueEquipment.map(eq => (
              <Chip
                key={eq}
                label={eq}
                size="small"
                sx={{
                  height: 28,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background:
                    'linear-gradient(135deg, rgba(76,175,80,0.18) 0%, rgba(46,125,50,0.1) 100%)',
                  border: '1px solid rgba(76,175,80,0.35)'
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Stats */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            mb: 1.8,
            opacity: 0.85
          }}
        >
          {exercisesList.length} Exercises • {variant.exerciseOrder.length} Sets
        </Typography>

        {/* Exercise Panel */}
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            mb: 3,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)'
          }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {exercisesList.map(ex => (
              <Chip
                key={ex.name}
                label={`${ex.name} (${ex.sets}x)`}
                sx={{
                  height: 32,
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background:
                    'linear-gradient(135deg, rgba(102,187,106,0.18) 0%, rgba(46,125,50,0.1) 100%)',
                  border: '1px solid rgba(76,175,80,0.35)'
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* CTA */}
        <Button
          fullWidth
          variant="contained"
          onClick={onStart}
          startIcon={<PlayArrowIcon />}
          sx={{
            borderRadius: 2,
            py: 1.4,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 800,
            background:
              'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            boxShadow: '0 6px 20px rgba(76,175,80,0.45)',
            transition: 'all 0.25s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 28px rgba(76,175,80,0.6)'
            }
          }}
        >
          Start Workout
        </Button>
      </Box>
    </Card>
  )
}
