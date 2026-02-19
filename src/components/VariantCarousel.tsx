import React from "react"
import {
  Card,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  IconButton
} from "@mui/material"

import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

import type { Variant } from "../data/workoutUtils"

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

  /* ========= DATA ========= */

  const exercisesListLocal = selectedVariant.exerciseOrder.reduce<
    { name: string; sets: number }[]
  >((acc, ex) => {
    const existing = acc.find((e) => e.name === ex.name)
    if (existing) existing.sets += 1
    else acc.push({ name: ex.name, sets: 1 })
    return acc
  }, [])

  const uniqueEquipmentLocal = Array.from(
    new Set(selectedVariant.exerciseOrder.flatMap((ex) => ex.equipment))
  )

  /* ========= UI ========= */

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{
        width: "100%",
        mb: 1
      }}
    >
      {/* LEFT BUTTON */}
      <IconButton size="small" onClick={onPrev}>
        <ChevronLeftIcon />
      </IconButton>

      {/* CARD */}
      <Card
        sx={{
          px: 2,
          py: 2,
          borderRadius: 2,
          textAlign: "center",

          /* key change: card does NOT stretch full width */
          width: "fit-content",
          maxWidth: 420,

          background:
            "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#81c784",
            fontWeight: 600,
            letterSpacing: "1px"
          }}
        >
          {currentIndex + 1} of {variants.length}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mt: 0.5,
            mb: 2,

            /* wrap long titles instead of expanding width */
            wordBreak: "break-word",
            whiteSpace: "normal",

            background:
              "linear-gradient(135deg,#a5d6a7 0%,#2e7d32 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {selectedVariant.variantName}
        </Typography>

        {/* EQUIPMENT */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 2,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1}
          >
            {uniqueEquipmentLocal.map(eq => (
              <Chip key={eq} label={eq} size="small" />
            ))}
          </Stack>
        </Box>

        <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.08)" }} />

        <Typography variant="body2" sx={{ mb: 2, fontWeight: 700 }}>
          {exercisesListLocal.length} Exercises • {selectedVariant.exerciseOrder.length} Sets
        </Typography>

        {/* EXERCISES */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 2,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {exercisesListLocal.map(ex => (
              <Chip key={ex.name} label={`${ex.name} (${ex.sets}x)`} size="small" />
            ))}
          </Stack>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStart}
          size="small"
          fullWidth
        >
          Start Workout
        </Button>
      </Card>

      {/* RIGHT BUTTON */}
      <IconButton size="small" onClick={onNext}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  )
}
