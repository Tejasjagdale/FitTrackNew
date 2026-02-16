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

  // ---------- Swipe + Parallax ----------
  const handleStart = (x: number) => {
    startX.current = x
  }

  const handleMove = (x: number) => {
    if (startX.current === null) return
    const diff = x - startX.current
    setDragX(diff)
  }

  const handleEnd = (x: number) => {
    if (startX.current === null) return
    const diff = x - startX.current

    if (diff > 80) onPrev()
    else if (diff < -80) onNext()

    startX.current = null
    setDragX(0)
  }

  // ---------- Data aggregation ----------
  const exercisesList = selectedVariant.exerciseOrder.reduce<{ name: string; sets: number }[]>((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  const uniqueEquipment = Array.from(
    new Set(selectedVariant.exerciseOrder.flatMap((ex) => ex.equipment))
  )

  // ---------- Motion math ----------
  const rotate = dragX * 0.04          // parallax tilt
  const translate = dragX * 0.9
  const shadowIntensity = Math.min(Math.abs(dragX) / 120, 1)

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
        userSelect: 'none',
        perspective: 1200
      }}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={(e) => handleEnd(e.clientX)}
      onMouseLeave={(e) => handleEnd(e.clientX)}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={(e) => handleEnd(e.changedTouches[0].clientX)}
    >
      <Box
        key={currentIndex}
        sx={{
          transform: `
            translateX(${translate}px)
            rotateY(${rotate}deg)
            scale(${1 - shadowIntensity * 0.04})
          `,
          transition: startX.current
            ? 'none'
            : 'transform 520ms cubic-bezier(.18,1.35,.4,1)', // momentum overshoot easing
        }}
      >
        <Card
          sx={{
            position: 'relative',
            p: 4,
            minWidth: 340,
            borderRadius: 4,
            textAlign: 'center',
            overflow: 'hidden',

            // ----- Premium Glass Surface -----
            background:
              'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.12)',

            // ----- Deep Layered Shadow -----
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',

            transition: 'all .35s cubic-bezier(.22,.61,.36,1)',

            '&:hover': {
              transform: 'translateY(-6px) scale(1.01)',
              boxShadow:
                '0 40px 110px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)'
            },

            // ----- Energy Accent Bar -----
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 6,
              background:
                'linear-gradient(90deg,#66bb6a 0%,#4caf50 40%,#2e7d32 100%)'
            },

            // ----- Soft Light Reflection -----
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -80,
              left: -60,
              width: 220,
              height: 220,
              background:
                'radial-gradient(circle, rgba(102,187,106,0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }
          }}
        >
          {/* Counter */}
          <Typography
            variant="caption"
            sx={{
              color: '#81c784',
              fontWeight: 800,
              letterSpacing: '1px'
            }}
          >
            {currentIndex + 1} of {variants.length}
          </Typography>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 900,
              mt: 1,
              mb: 2.5,
              background:
                'linear-gradient(135deg,#a5d6a7 0%,#2e7d32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {selectedVariant.variantName}
          </Typography>

          {/* Equipment Panel */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              mb: 2.5,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
              {uniqueEquipment.map(eq => (
                <Chip
                  key={eq}
                  label={eq}
                  size="small"
                  sx={{
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ mb: 2.5, borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* Stats */}
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              fontWeight: 700,
              opacity: 0.9
            }}
          >
            {exercisesList.length} Exercises • {selectedVariant.exerciseOrder.length} Sets
          </Typography>

          {/* Exercises Panel */}
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
                justifyContent: 'flex-start',   // IMPORTANT
                alignItems: 'center'
              }}
            >
              {exercisesList.map(ex => (
                <Chip
                  key={ex.name}
                  label={`${ex.name} (${ex.sets}x)`}
                  sx={{
                    fontWeight: 700,
                    maxWidth: '100%',
                    background:
                      'linear-gradient(135deg,rgba(102,187,106,0.22),rgba(46,125,50,0.12))',
                    border: '1px solid rgba(102,187,106,0.45)',
                    '& .MuiChip-label': {
                      px: 1.2,
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              ))}
            </Box>

          </Box>

          {/* CTA */}
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onStart}
            fullWidth
            sx={{
              borderRadius: 2.5,
              py: 1.5,
              fontWeight: 900,
              textTransform: 'none',
              fontSize: '1rem',
              background:
                'linear-gradient(135deg,#66bb6a 0%,#2e7d32 100%)',
              boxShadow: '0 14px 40px rgba(76,175,80,0.55)',
              transition: 'all .25s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 18px 55px rgba(76,175,80,0.75)'
              }
            }}
          >
            Start Workout
          </Button>
        </Card>

      </Box>
    </Box>
  )
}
