// src/components/TodayWorkoutCard.tsx
import React from 'react'
import {
  Card,
  Chip,
  Stack,
  Typography,
  Divider,
  Button
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import type { Variant } from '../data/workoutUtils'

interface Props {
  variant: Variant
  onStart: () => void
}

export default function TodayWorkoutCard({ variant, onStart }: Props) {
  // Aggregate exercises with total sets
  const exercisesList = variant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  // Unique equipment
  const uniqueEquipment = Array.from(
    new Set(variant.exerciseOrder.flatMap((ex) => ex.equipment))
  )

  return (
    <Card
      sx={{
        p: 4,
        mx: 'auto',
        maxWidth: 450,
        borderRadius: 3,
        textAlign: 'center',
        boxShadow: 6
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {variant.variantName}
      </Typography>

      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
        Equipment Needed:
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ flexWrap: 'wrap', mb: 2 }}
      >
        {uniqueEquipment.map(eq => (
          <Chip key={eq} label={eq} color="warning" variant="outlined" size="small" />
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {exercisesList.length} exercises • {variant.exerciseOrder.length} sets total
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ flexWrap: 'wrap', mb: 2 }}
      >
        {exercisesList.map(ex => (
          <Chip
            key={ex.name}
            label={`${ex.name} (${ex.sets}x)`}
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>

      <Button
        variant="contained"
        onClick={onStart}
        startIcon={<PlayArrowIcon />}
        sx={{
          mt: 2,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 16,
          fontWeight: 600
        }}
      >
        Start This Workout
      </Button>
    </Card>
  )
}
