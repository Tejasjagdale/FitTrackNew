import React, { useState } from 'react'
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Chip,
  Grid,
  useTheme
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'

interface EditExerciseRowProps {
  exercise: ExerciseOrder
  onUpdate: (updated: ExerciseOrder) => void
  onDelete: () => void
}

export function EditExerciseRow({ exercise, onUpdate, onDelete }: EditExerciseRowProps) {
  const theme = useTheme()
  const [editDialog, setEditDialog] = useState(false)
  const [reps, setReps] = useState(exercise.reps)
  const [rest, setRest] = useState(exercise.restSeconds.toString())

  const handleSave = () => {
    onUpdate({
      ...exercise,
      reps,
      restSeconds: parseInt(rest) || 60
    })
    setEditDialog(false)
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
            Set {exercise.set}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Step {exercise.step}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip label={`${exercise.reps} reps`} size="small" color="primary" />
          <Chip label={`${exercise.restSeconds}s rest`} size="small" variant="outlined" />
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
          />
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

interface EditVariantCardProps {
  variant: Variant
  onUpdate: (updated: Variant) => void
}

export function EditVariantCard({ variant, onUpdate }: EditVariantCardProps) {
  const theme = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [addSetDialog, setAddSetDialog] = useState(false)
  const [newSetReps, setNewSetReps] = useState('8-12')
  const [newSetRest, setNewSetRest] = useState('60')
  const [selectedExerciseName, setSelectedExerciseName] = useState('')

  const handleUpdateSet = (index: number, updated: ExerciseOrder) => {
    const newOrder = [...variant.exerciseOrder]
    newOrder[index] = updated
    onUpdate({ ...variant, exerciseOrder: newOrder })
  }

  const handleDeleteSet = (index: number) => {
    const deleted = variant.exerciseOrder[index]
    const newOrder = variant.exerciseOrder
      .filter((_, i) => i !== index)
      .map((ex, i) => ({ ...ex, step: i + 1 }))

    onUpdate({ ...variant, exerciseOrder: newOrder })
  }

  const handleAddSet = () => {
    if (!selectedExerciseName) return

    const lastSet = variant.exerciseOrder
      .filter((ex) => ex.name === selectedExerciseName)
      .pop()

    const newStep = variant.exerciseOrder.length + 1
    const newSet: ExerciseOrder = {
      step: newStep,
      name: selectedExerciseName,
      set: (lastSet?.set || 0) + 1,
      reps: newSetReps,
      restSeconds: parseInt(newSetRest) || 60,
    }

    onUpdate({
      ...variant,
      exerciseOrder: [...variant.exerciseOrder, newSet]
    })

    setAddSetDialog(false)
    setSelectedExerciseName('')
    setNewSetReps('8-12')
    setNewSetRest('60')
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      sx={{
        mb: 2,
        borderRadius: 3,
        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.55)',
        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        backdropFilter: 'blur(10px) saturate(130%)',
        WebkitBackdropFilter: 'blur(10px) saturate(130%)'
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>{variant.variantName}</Typography>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(!isEditing)
            }}
            color={isEditing ? 'primary' : 'default'}
            size="small"
            aria-label="edit-variant"
          >
            <EditIcon />
          </IconButton>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {isEditing && (
          <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                select
                label="Exercise"
                value={selectedExerciseName}
                onChange={(e) => setSelectedExerciseName(e.target.value)}
                SelectProps={{
                  native: true
                }}
                sx={{ minWidth: '200px' }}
              >
                <option value="">Select exercise</option>
                {variant.exercisesList.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Reps"
                value={newSetReps}
                onChange={(e) => setNewSetReps(e.target.value)}
                placeholder="8-12"
                sx={{ minWidth: '120px' }}
              />
              <TextField
                label="Rest (s)"
                type="number"
                value={newSetRest}
                onChange={(e) => setNewSetRest(e.target.value)}
                inputProps={{ min: 10 }}
                sx={{ minWidth: '100px' }}
              />
              <Button startIcon={<AddIcon />} onClick={handleAddSet} variant="contained">
                Add Set
              </Button>
            </Stack>
          </Box>
        )}

        <Box>
          {Array.from(new Set(variant.exerciseOrder.map((ex) => ex.name))).map((exerciseName) => (
            <Box key={exerciseName} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                {exerciseName}
              </Typography>
              {variant.exerciseOrder
                .map((ex, idx) => ({ ex, idx }))
                .filter(({ ex }) => ex.name === exerciseName)
                .map(({ ex, idx }) => (
                  <EditExerciseRow
                    key={idx}
                    exercise={ex}
                    onUpdate={(updated) => handleUpdateSet(idx, updated)}
                    onDelete={() => handleDeleteSet(idx)}
                  />
                ))}
            </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
