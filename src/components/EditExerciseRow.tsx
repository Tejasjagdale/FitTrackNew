import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { ExerciseOrder } from '../data/workoutUtils'

interface EditExerciseRowProps {
  exercise: ExerciseOrder
  equipmentOptions: string[]
  onUpdate: (updated: ExerciseOrder) => void
  onDelete: () => void
}

export function EditExerciseRow({
  exercise,
  equipmentOptions,
  onUpdate,
  onDelete
}: EditExerciseRowProps) {
  const theme = useTheme()
  const [editDialog, setEditDialog] = useState(false)
  const [reps, setReps] = useState(exercise.reps)
  const [rest, setRest] = useState(exercise.restSeconds.toString())
  const [equipment, setEquipment] = useState<string[]>(
    Array.isArray(exercise.equipment) ? exercise.equipment : []
  )

  const handleSave = () => {
    onUpdate({
      ...exercise,
      reps,
      restSeconds: parseInt(rest, 10) || 60,
      equipment
    })
    setEditDialog(false)
  }

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
          borderRadius: 2,
          gap: 1,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ minWidth: 160 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {exercise.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Step {exercise.step} • Set {exercise.set}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap', flexGrow: 1 }}
        >
          <Chip label={`${exercise.reps} reps`} size="small" color="primary" />
          <Chip
            label={`${exercise.restSeconds}s rest`}
            size="small"
            variant="outlined"
          />
          {exercise.equipment && exercise.equipment.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              {exercise.equipment.map((eq: string) => (
                <Chip
                  key={eq}
                  label={eq}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: 120 }}
                />
              ))}
            </Stack>
          )}
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setEditDialog(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Edit dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Set</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="e.g., 8-12 or max"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Rest (seconds)"
            type="number"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            inputProps={{ min: 10 }}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Equipment (select multiple)
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
            {equipmentOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                onClick={() => toggleEquipment(opt)}
                color={equipment.includes(opt) ? 'primary' : 'default'}
                variant={equipment.includes(opt) ? 'filled' : 'outlined'}
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
