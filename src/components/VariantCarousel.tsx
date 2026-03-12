import React from "react"
import {
  Card,
  Chip,
  Stack,
  Typography,
  Button,
  Divider,
  Box,
  IconButton,
  useTheme
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
  const theme = useTheme()

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
      spacing={{ xs: 0.5, sm: 1 }}
      sx={{
        width: "100%",
        mb: 1,
        px: { xs: 1, sm: 0 }
      }}
    >
      {/* LEFT BUTTON */}
      <IconButton
        size="small"
        onClick={onPrev}
        sx={{
          bgcolor: `${theme.palette.background.paper}`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* CARD */}
      <Card
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2, sm: 2.5 },

          borderRadius: 2,
          textAlign: "center",

          width: "100%",
          maxWidth: 420,

          background: theme.palette.background.paper,

          backdropFilter: "blur(18px)",

          border: `1px solid ${theme.palette.divider}`,

          boxShadow:
            theme.palette.mode === "dark"
              ? "0 20px 60px rgba(0,0,0,0.55)"
              : "0 10px 30px rgba(0,0,0,0.08)"
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.primary.main,
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

            background: `linear-gradient(
  135deg,
  ${theme.palette.primary.light},
  ${theme.palette.primary.dark}
)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {selectedVariant.variantName}
        </Typography>
        <Typography variant="caption" sx={{ mb: 1, fontWeight: 300 }}>
          Equipments needed
        </Typography>

        {/* EQUIPMENT */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 2,
            background: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1}
          >
            {uniqueEquipmentLocal.map(eq => (
              <Chip
                key={eq}
                label={eq}
                size="small"
                sx={{
                  height: 24,
                  fontSize: 11,
                  fontWeight: 500,

                  color: theme.palette.text.primary,
                  background: `${theme.palette.primary.main}15`,
                  border: `1px solid ${theme.palette.primary.main}40`,

                  "& .MuiChip-label": {
                    px: 0.8
                  }
                }}
              />

            ))}
          </Stack>
        </Box>

        <Divider sx={{ mb: 1, borderColor: theme.palette.divider }} />

        <Typography variant="caption" sx={{ fontWeight: 300 }}>
          {exercisesListLocal.length} Exercises • {selectedVariant.exerciseOrder.length} Sets
        </Typography>

        {/* EXERCISES */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 2,
            mt: 1,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        >
          <Stack direction="row" flexWrap="wrap" gap={0.8}>
            {exercisesListLocal.map(ex => (
              <Chip
                key={ex.name}
                label={
                  <Box sx={{ display: "flex", gap: 0.6, alignItems: "center" }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: 0.9
                      }}
                    >
                      {ex.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 11,
                        px: 0.6,
                        py: "1px",
                        borderRadius: 1,
                        background: `${theme.palette.primary.main}25`,
                        color: theme.palette.primary.light,
                        fontWeight: 700
                      }}
                    >
                      {ex.sets}x
                    </Typography>
                  </Box>
                }
                size="small"
                sx={{
                  height: 26,
                  px: 0.6,

                  color: theme.palette.text.primary,

                  background: `${theme.palette.primary.main}18`,

                  border: `1px solid ${theme.palette.primary.main}45`,

                  "& .MuiChip-label": {
                    px: 0.6
                  }
                }}

              />
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
      <IconButton
        size="small"
        onClick={onNext}
        sx={{
          bgcolor: `${theme.palette.background.paper}`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  )
}
