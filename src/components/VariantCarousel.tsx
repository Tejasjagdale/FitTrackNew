import React, { useRef, useState } from 'react'
import {
  Card,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
  Box
} from '@mui/material'
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

  const startX = useRef<number | null>(null)
  const [dragX, setDragX] = useState(0)

  if (!selectedVariant) return null

  /* ================= CIRCULAR INDEXING ================= */

  const total = variants.length

  const getIndex = (i: number) => {
    if (i < 0) return total - 1
    if (i >= total) return 0
    return i
  }

  const prevIndex = getIndex(currentIndex - 1)
  const nextIndex = getIndex(currentIndex + 1)

  const prev = variants[prevIndex]
  const next = variants[nextIndex]

  /* ================= SWIPE ================= */

  const handleStart = (x: number) => {
    startX.current = x
  }

  const handleMove = (x: number) => {
    if (startX.current === null) return
    setDragX(x - startX.current)
  }

  const handleEnd = (x: number) => {
    if (startX.current === null) return

    const diff = x - startX.current

    if (diff > 80) onPrev()
    else if (diff < -80) onNext()

    startX.current = null
    setDragX(0)
  }

  /* ================= MOTION ================= */

  const damp = 0.65
  const clamp = Math.max(-320, Math.min(320, dragX * damp))
  const progress = clamp / 300

  const mainTranslate = clamp
  const mainRotate = clamp * 0.04

  const nextTranslate = 340 + clamp
  const prevTranslate = -340 + clamp

  const mainScale = 1 - Math.abs(progress) * 0.06
  const sideScale = 0.88 + Math.abs(progress) * 0.04

  /* ================= CARD ================= */

  const renderCard = (variant: Variant) => {

    const exercisesListLocal = variant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
      const existing = acc.find((e) => e.name === ex.name)
      if (existing) existing.sets += 1
      else acc.push({ name: ex.name, sets: 1 })
      return acc
    }, [])

    const uniqueEquipmentLocal = Array.from(
      new Set(variant.exerciseOrder.flatMap((ex) => ex.equipment))
    )

    return (
      <Card
        sx={{
          position: 'relative',
          p: 2,
          minWidth: 340,
          borderRadius: 2,
          textAlign: 'center',
          overflow: 'hidden',
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow:
            '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#81c784',
            fontWeight: 600,
            letterSpacing: '1px'
          }}
        >
          {currentIndex + 1} of {variants.length}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mt: 0.5,
            mb: 2,
            background:
              'linear-gradient(135deg,#a5d6a7 0%,#2e7d32 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {variant.variantName}
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            mb: 3,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.2,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {uniqueEquipmentLocal.map(eq => (
              <Chip key={eq} label={eq} size="small" />
            ))}
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

        <Typography
          variant="body2"
          sx={{
            mb: 2,
            fontWeight: 700,
            opacity: 0.9
          }}
        >
          {exercisesListLocal.length} Exercises • {variant.exerciseOrder.length} Sets
        </Typography>

        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
            mb: 3,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.2,
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}
          >
            {exercisesListLocal.map(ex => (
              <Chip key={ex.name} label={`${ex.name} (${ex.sets}x)`} />
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          fullWidth
        >
          Start Workout
        </Button>
      </Card>
    )
  }

  /* ================= UI ================= */

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 1,
        userSelect: 'none',
        perspective: 1200,
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        touchAction: 'pan-y'
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={(e) => handleEnd(e.clientX)}
      onMouseLeave={(e) => handleEnd(e.clientX)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
    >

      {/* PREV CARD */}
      <Box
        sx={{
          position: 'absolute',
          transform: `translateX(${prevTranslate}px) scale(${sideScale})`,
          opacity: 0.6,
          transition: startX.current ? 'none' : 'transform 480ms cubic-bezier(.22,1,.36,1)'
        }}
      >
        {renderCard(prev)}
      </Box>

      {/* ACTIVE CARD */}
      <Box
        key={currentIndex}
        sx={{
          transform: `translateX(${mainTranslate}px) rotateY(${mainRotate}deg) scale(${mainScale})`,
          zIndex: 2,
          transition: startX.current ? 'none' : 'transform 480ms cubic-bezier(.22,1,.36,1)'
        }}
      >
        {renderCard(selectedVariant)}
      </Box>

      {/* NEXT CARD */}
      <Box
        sx={{
          position: 'absolute',
          transform: `translateX(${nextTranslate}px) scale(${sideScale})`,
          opacity: 0.6,
          transition: startX.current ? 'none' : 'transform 480ms cubic-bezier(.22,1,.36,1)'
        }}
      >
        {renderCard(next)}
      </Box>

    </Box>
  )
}
