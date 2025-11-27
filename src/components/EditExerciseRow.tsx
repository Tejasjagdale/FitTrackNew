import React, { useState } from 'react'
import {
  Box,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  useTheme,
  Button
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

export function EditExerciseRow({ exercise, equipmentOptions, onUpdate, onDelete }: EditExerciseRowProps) {
  const theme = useTheme()
  const [editDialog, setEditDialog] = useState(false)
  const [reps, setReps] = useState(exercise.reps)
  const [rest, setRest] = useState(exercise.restSeconds.toString())
  const [equipment, setEquipment] = useState<string[]>(Array.isArray(exercise.equipment) ? exercise.equipment : [])

  const handleSave = () => {
    onUpdate({
      ...exercise,
      reps,
      restSeconds: parseInt(rest) || 60,
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
          mb: 1,
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,200,83,0.04)',
          borderRadius: 2,
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,200,83,0.1)'}`,
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Box sx={{ flex: 1, minWidth: '150px' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {exercise.name} — Set {exercise.set}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Step {exercise.step}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={`${exercise.reps} reps`} size="small" color="primary" />
          <Chip label={`${exercise.restSeconds}s rest`} size="small" variant="outlined" />
          {exercise.equipment && exercise.equipment.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              {exercise.equipment.map((eq: string) => (
                <Chip key={eq} label={eq} size="small" variant="outlined" color="default" />
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

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Set {exercise.set}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="e.g., 8-12 or max or AMRAP"
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
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {equipmentOptions.map((opt) => (
              <Chip
                key={opt}
                label={opt}
                onClick={() => toggleEquipment(opt)}
                color={equipment.includes(opt) ? 'primary' : 'default'}
                variant={equipment.includes(opt) ? 'filled' : 'outlined'}
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
