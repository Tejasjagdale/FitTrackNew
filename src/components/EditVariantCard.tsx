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
  useTheme,
  Select,
  MenuItem
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { getData } from '../data/dataService'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'

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
            Set {exercise.set}
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

interface EditVariantCardProps {
  variant: Variant
  onUpdate: (updated: Variant) => void
}

export function EditVariantCard({ variant, onUpdate }: EditVariantCardProps) {
  const theme = useTheme()
  const equipmentOptions = (getData() as any).equipments || []
  const [isEditing, setIsEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [variantName, setVariantName] = useState(variant.variantName)
  const [variantNameDialog, setVariantNameDialog] = useState(false)
  const [addSetDialog, setAddSetDialog] = useState(false)
  const [newExerciseName, setNewExerciseName] = useState('')
  const [newSetReps, setNewSetReps] = useState('8-12')
  const [newSetRest, setNewSetRest] = useState('60')
  const [newSetEquipment, setNewSetEquipment] = useState<string[]>([])

  const handleUpdateVariantName = () => {
    if (variantName && variantName !== variant.variantName) {
      onUpdate({ ...variant, variantName })
    }
    setVariantNameDialog(false)
  }

  const handleUpdateSet = (index: number, updated: ExerciseOrder) => {
    const newOrder = [...variant.exerciseOrder]
    newOrder[index] = updated
    onUpdate({ ...variant, exerciseOrder: newOrder })
  }

  const handleDeleteSet = (index: number) => {
    const deleted = variant.exerciseOrder[index]
    const newOrder = (variant.exerciseOrder as any[])
      .filter((_: any, i: number) => i !== index)
      .map((ex: any, i: number) => ({ ...ex, step: i + 1 }))

    onUpdate({ ...variant, exerciseOrder: newOrder })
  }

  const handleAddSet = () => {
    if (!newExerciseName) return

    const newStep = variant.exerciseOrder.length + 1
    const lastSet = (variant.exerciseOrder as any[])
      .filter((ex: any) => ex.name === newExerciseName)
      .pop()

    const newSet: ExerciseOrder = {
      step: newStep,
      name: newExerciseName,
      set: (lastSet?.set || 0) + 1,
      reps: newSetReps,
      restSeconds: parseInt(newSetRest) || 60,
      equipment: newSetEquipment
    }

    onUpdate({
      ...variant,
      exerciseOrder: [...variant.exerciseOrder, newSet]
    })

    setAddSetDialog(false)
    setNewExerciseName('')
    setNewSetReps('8-12')
    setNewSetRest('60')
    setNewSetEquipment([])
  }

  const toggleNewSetEquipment = (item: string) => {
    setNewSetEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
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
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>{variantName}</Typography>
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                setVariantNameDialog(true)
              }}
              color="default"
              size="small"
              aria-label="edit-name"
              title="Edit variant name"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(!isEditing)
              }}
              color={isEditing ? 'primary' : 'default'}
              size="small"
              aria-label="edit-variant"
              title="Add/Edit exercises"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {isEditing && (
          <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.primary.main }}>
              Add New Exercise Set
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" sx={{ flexWrap: 'wrap' }}>
              <TextField
                label="Exercise Name"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g., Dumbbell Curl"
                sx={{ minWidth: '200px' }}
              />
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
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2, color: theme.palette.primary.main }}>
              Equipment (select multiple)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {equipmentOptions.map((opt: string) => (
                <Chip
                  key={opt}
                  label={opt}
                  onClick={() => toggleNewSetEquipment(opt)}
                  color={newSetEquipment.includes(opt) ? 'primary' : 'default'}
                  variant={newSetEquipment.includes(opt) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          {Array.from(new Set((variant.exerciseOrder as any[]).map((ex: any) => ex.name))).map((exerciseName: string) => (
            <Box key={exerciseName} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
                {exerciseName}
              </Typography>
              {variant.exerciseOrder
                .map((ex: any, idx: number) => ({ ex, idx }))
                .filter(({ ex }: { ex: any }) => ex.name === exerciseName)
                .map(({ ex, idx }: { ex: any; idx: number }) => (
                  <EditExerciseRow
                    key={idx}
                    exercise={ex}
                    equipmentOptions={equipmentOptions}
                    onUpdate={(updated) => handleUpdateSet(idx, updated)}
                    onDelete={() => handleDeleteSet(idx)}
                  />
                ))}
            </Box>
          ))}
        </Box>
      </AccordionDetails>

      {/* Edit Variant Name Dialog */}
      <Dialog open={variantNameDialog} onClose={() => setVariantNameDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Variant Name</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Variant Name"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
            placeholder="e.g., Arms Variant 1"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariantNameDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateVariantName} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}
