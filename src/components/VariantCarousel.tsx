import React from 'react'
import { Card, Chip, Stack, Typography, IconButton, Button, Divider } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import type { Variant } from '../data/workoutUtils'

interface Props {
  variants: Variant[]
  currentIndex: number
  selectedVariant: Variant | null
  onPrev: () => void
  onNext: () => void
  onStart: () => void
}

export default function VariantCarousel({
  variants,
  currentIndex,
  selectedVariant,
  onPrev,
  onNext,
  onStart
}: Props) {
  if (!selectedVariant) return null

  // Aggregate exercises with total sets
  const exercisesList = selectedVariant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  // Aggregate unique equipment
  const uniqueEquipment = Array.from(
    new Set(selectedVariant.exerciseOrder.flatMap((ex) => ex.equipment))
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
      <IconButton onClick={onPrev}><ArrowBackIosIcon /></IconButton>

      <Card sx={{ p: 4, mx: 2, minWidth: 320, borderRadius: 3, textAlign: 'center', boxShadow: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {selectedVariant.variantName}
        </Typography>

        {/* Equipment section */}
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
          Equipment Needed:
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', mb: 2 }}>
          {uniqueEquipment.map((eq) => (
            <Chip key={eq} label={eq} color="warning" variant="outlined" size="small" />
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Exercises section */}
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {exercisesList.length} exercises • {selectedVariant.exerciseOrder.length} sets total
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap', mb: 2 }}>
          {exercisesList.map((ex) => (
            <Chip key={ex.name} label={`${ex.name} (${ex.sets}x)`} color="primary" variant="outlined" />
          ))}
        </Stack>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
        >
          Start This Workout
        </Button>
      </Card>

      <IconButton onClick={onNext}><ArrowForwardIosIcon /></IconButton>
    </div>
  )
}
