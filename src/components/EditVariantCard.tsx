// src/components/EditVariantCard.tsx
import React, { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Autocomplete
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { getData } from '../data/dataService'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'
import { EditExerciseRow } from './EditExerciseRow'

interface EditVariantCardProps {
  variant: Variant
  onUpdate: (updated: Variant) => void
}

// Normalize steps + set numbers per exercise name
const normalizeOrder = (order: ExerciseOrder[]): ExerciseOrder[] => {
  const setsPerName: Record<string, number> = {}
  return order.map((ex, index) => {
    const count = (setsPerName[ex.name] || 0) + 1
    setsPerName[ex.name] = count
    return {
      ...ex,
      step: index + 1,
      set: count
    }
  })
}

// Rebuild exercisesList from exerciseOrder
const buildExercisesList = (
  exerciseOrder: ExerciseOrder[]
): { name: string; sets: number; reps: string }[] => {
  const map: Record<string, { name: string; sets: number; reps: string }> = {}

  exerciseOrder.forEach((ex) => {
    if (!map[ex.name]) {
      map[ex.name] = { name: ex.name, sets: 0, reps: ex.reps }
    }
    map[ex.name].sets += 1
  })

  return Object.values(map)
}

export function EditVariantCard({ variant, onUpdate }: EditVariantCardProps) {
  const theme = useTheme()
  const equipmentOptions = (getData() as any).equipments || []

  const [expanded, setExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [variantName, setVariantName] = useState(variant.variantName)
  const [variantNameDialog, setVariantNameDialog] = useState(false)

  const [newExerciseName, setNewExerciseName] = useState('')
  const [newSetReps, setNewSetReps] = useState('8-12')
  const [newSetRest, setNewSetRest] = useState('60')
  const [newSetEquipment, setNewSetEquipment] = useState<string[]>([])

  // DnD state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Exercise name options for autocomplete
  const exerciseNameOptions = useMemo(() => {
    const names = new Set<string>()
    if (variant.exercisesList) {
      variant.exercisesList.forEach((ex: any) => names.add(ex.name))
    }
    if (variant.exerciseOrder) {
      variant.exerciseOrder.forEach((ex: any) => names.add(ex.name))
    }
    return Array.from(names)
  }, [variant])

  const updateVariantWithOrder = (newOrder: ExerciseOrder[]) => {
    const normalized = normalizeOrder(newOrder)
    const newExercisesList = buildExercisesList(normalized)
    onUpdate({
      ...variant,
      exerciseOrder: normalized,
      exercisesList: newExercisesList
    })
  }

  const handleUpdateVariantName = () => {
    if (variantName && variantName !== variant.variantName) {
      onUpdate({ ...variant, variantName })
    }
    setVariantNameDialog(false)
  }

  const handleUpdateSet = (index: number, updated: ExerciseOrder) => {
    const newOrder = [...variant.exerciseOrder]
    newOrder[index] = updated
    updateVariantWithOrder(newOrder)
  }

  const handleDeleteSet = (index: number) => {
    const newOrder = variant.exerciseOrder.filter((_, i) => i !== index)
    updateVariantWithOrder(newOrder)
  }

  const handleAddSet = () => {
    if (!newExerciseName.trim()) return

    const lastSetForExercise = variant.exerciseOrder
      .filter((ex: ExerciseOrder) => ex.name === newExerciseName.trim())
      .pop()

    const newSet: ExerciseOrder = {
      step: variant.exerciseOrder.length + 1, // will be normalized anyway
      name: newExerciseName.trim(),
      set: (lastSetForExercise?.set || 0) + 1,
      reps: newSetReps,
      restSeconds: parseInt(newSetRest, 10) || 60,
      equipment: newSetEquipment
    }

    const newOrder = [...variant.exerciseOrder, newSet]
    updateVariantWithOrder(newOrder)

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

  // ---- DnD handlers (native HTML5) ----
  const handleDragStart =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      setDragIndex(index)
      setHoverIndex(index)
      e.dataTransfer.effectAllowed = 'move'
      // Needed for Firefox
      e.dataTransfer.setData('text/plain', String(index))
    }

  const handleDragOver =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setHoverIndex(index)
    }

  const handleDrop =
    (index: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (dragIndex === null || dragIndex === index) {
        setDragIndex(null)
        setHoverIndex(null)
        return
      }

      const newOrder = Array.from(variant.exerciseOrder)
      const [moved] = newOrder.splice(dragIndex, 1)
      newOrder.splice(index, 0, moved)

      updateVariantWithOrder(newOrder)
      setDragIndex(null)
      setHoverIndex(null)
    }

  const handleDragEnd = () => {
    setDragIndex(null)
    setHoverIndex(null)
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      sx={{
        mb: 2,
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 20px rgba(0,0,0,0.6)'
            : '0 8px 20px rgba(0,0,0,0.08)'
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.palette.primary.main, fontWeight: 700 }}
          >
            {variantName}
          </Typography>
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                setVariantNameDialog(true)
              }}
              size="small"
              title="Edit variant name"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing((prev) => !prev)
              }}
              color={isEditing ? 'primary' : 'default'}
              size="small"
              title="Add/Edit exercises"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {/* Add new exercise set */}
        {isEditing && (
          <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1.5, color: theme.palette.primary.main }}
            >
              Add New Exercise Set
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="flex-start"
              sx={{ flexWrap: 'wrap', mb: 2 }}
            >
              <Autocomplete
                freeSolo
                options={exerciseNameOptions}
                value={newExerciseName}
                onChange={(_, value) => setNewExerciseName(value ?? '')}
                onInputChange={(_, value) => setNewExerciseName(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exercise Name"
                    placeholder="e.g., Standing Dumbbell Curl"
                    sx={{ minWidth: 220 }}
                  />
                )}
              />

              <TextField
                label="Reps"
                value={newSetReps}
                onChange={(e) => setNewSetReps(e.target.value)}
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Rest (s)"
                type="number"
                value={newSetRest}
                onChange={(e) => setNewSetRest(e.target.value)}
                inputProps={{ min: 10 }}
                sx={{ minWidth: 100 }}
              />
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddSet}
                variant="contained"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add Set
              </Button>
            </Stack>

            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}
            >
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
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Exercise order with DnD */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Exercise Order (drag rows to reorder)
          </Typography>

          {variant.exerciseOrder.map((exercise: ExerciseOrder, idx: number) => {
            const isDragging = dragIndex === idx
            const isHover = hoverIndex === idx && dragIndex !== null

            return (
              <Box
                key={`${exercise.name}-${idx}`}
                draggable
                onDragStart={handleDragStart(idx)}
                onDragOver={handleDragOver(idx)}
                onDrop={handleDrop(idx)}
                onDragEnd={handleDragEnd}
                sx={{
                  mb: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${
                    isDragging || isHover
                      ? theme.palette.primary.main
                      : theme.palette.divider
                  }`,
                  backgroundColor: isDragging
                    ? theme.palette.action.selected
                    : isHover
                    ? theme.palette.action.hover
                    : theme.palette.background.default,
                  display: 'flex',
                  alignItems: 'stretch',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
              >
                {/* Drag handle */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1,
                    borderRight: `1px solid ${theme.palette.divider}`,
                    cursor: 'grab'
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </Box>

                {/* Row content */}
                <Box sx={{ flex: 1 }}>
                  <EditExerciseRow
                    exercise={exercise}
                    equipmentOptions={equipmentOptions}
                    onUpdate={(updated) => handleUpdateSet(idx, updated)}
                    onDelete={() => handleDeleteSet(idx)}
                  />
                </Box>
              </Box>
            )
          })}
        </Box>
      </AccordionDetails>

      {/* Variant Name Dialog */}
      <Dialog
        open={variantNameDialog}
        onClose={() => setVariantNameDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Variant Name</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Variant Name"
            value={variantName}
            onChange={(e) => setVariantName(e.target.value)}
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
