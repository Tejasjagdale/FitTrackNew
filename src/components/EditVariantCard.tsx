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
import DeleteIcon from '@mui/icons-material/Delete'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import { getData } from '../data/dataService'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'
import { EditExerciseRow } from './EditExerciseRow'

interface EditVariantCardProps {
  variant: Variant
  onUpdate: (updated: Variant) => void
  onDelete: () => void
}

const normalizeOrder = (order: ExerciseOrder[]): ExerciseOrder[] => {
  const setsPer: Record<string, number> = {}
  return order.map((ex, idx) => {
    const count = (setsPer[ex.name] || 0) + 1
    setsPer[ex.name] = count
    return {
      ...ex,
      step: idx + 1,
      set: count
    }
  })
}

const buildExercisesList = (order: ExerciseOrder[]) => {
  const map: Record<string, any> = {}
  order.forEach((ex) => {
    if (!map[ex.name]) {
      map[ex.name] = { name: ex.name, sets: 0, reps: ex.reps }
    }
    map[ex.name].sets += 1
  })
  return Object.values(map)
}

export function EditVariantCard({ variant, onUpdate, onDelete }: EditVariantCardProps) {
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

  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const exerciseNameOptions = useMemo(() => {
    const names = new Set<string>()
    variant.exercisesList?.forEach((ex) => names.add(ex.name))
    variant.exerciseOrder?.forEach((ex) => names.add(ex.name))
    return Array.from(names)
  }, [variant])

  const updateVariant = (order: ExerciseOrder[]) => {
    const normalized = normalizeOrder(order)
    onUpdate({
      ...variant,
      id: variant.id,
      exerciseOrder: normalized,
      exercisesList: buildExercisesList(normalized)
    })
  }

  const toggleNewSetEquipment = (item: string) => {
    setNewSetEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const handleAddSet = () => {
    if (!newExerciseName.trim()) return

    const lastSet = variant.exerciseOrder
      .filter((ex) => ex.name === newExerciseName.trim())
      .pop()

    const newSet: ExerciseOrder = {
      step: variant.exerciseOrder.length + 1,
      name: newExerciseName.trim(),
      set: (lastSet?.set || 0) + 1,
      reps: newSetReps,
      restSeconds: parseInt(newSetRest, 10) || 60,
      equipment: newSetEquipment
    }

    updateVariant([...variant.exerciseOrder, newSet])

    setNewExerciseName('')
    setNewSetReps('8-12')
    setNewSetRest('60')
    setNewSetEquipment([])
  }

  const handleUpdateSet = (index: number, updated: ExerciseOrder) => {
    const order = [...variant.exerciseOrder]

    // detect rename
    const oldName = order[index].name
    const newName = updated.name

    // update the edited set
    order[index] = updated

    // if renamed → update all sets with same old name
    if (oldName !== newName) {
      order.forEach((s) => {
        if (s.name === oldName) s.name = newName
      })
    }

    updateVariant(order)
  }


  const handleDeleteSet = (index: number) => {
    updateVariant(variant.exerciseOrder.filter((_, i) => i !== index))
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, e) => setExpanded(e)}
      sx={{
        mb: 2,
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 20px rgba(0,0,0,0.6)'
            : '0 8px 20px rgba(0,0,0,0.08)'
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            {variantName}
          </Typography>

          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <IconButton size="small" onClick={() => setVariantNameDialog(true)}>
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setIsEditing((p) => !p)}
              color={isEditing ? 'primary' : 'default'}
            >
              <AddIcon fontSize="small" />
            </IconButton>

            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {/* Add Exercise Section */}
        {isEditing && (
          <Box sx={{ mb: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography sx={{ fontWeight: 600, mb: 2 }} variant="subtitle2">
              Add New Exercise Set
            </Typography>

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <Autocomplete
                freeSolo
                options={exerciseNameOptions}
                value={newExerciseName}
                onChange={(_, val) => setNewExerciseName(val ?? '')}
                onInputChange={(_, val) => setNewExerciseName(val)}
                renderInput={(p) => <TextField {...p} label="Exercise Name" />}
              />

              <TextField label="Reps" value={newSetReps} onChange={(e) => setNewSetReps(e.target.value)} />
              <TextField
                label="Rest (s)"
                type="number"
                value={newSetRest}
                onChange={(e) => setNewSetRest(e.target.value)}
              />

              <Button onClick={handleAddSet} variant="contained" startIcon={<AddIcon />}>
                Add Set
              </Button>
            </Stack>

            <Typography sx={{ mt: 2, fontWeight: 600 }} variant="subtitle2">
              Equipment
            </Typography>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {equipmentOptions.map((opt: string) => (
                <Chip
                  key={opt}
                  label={opt}
                  clickable
                  color={newSetEquipment.includes(opt) ? 'primary' : 'default'}
                  variant={newSetEquipment.includes(opt) ? 'filled' : 'outlined'}
                  onClick={() => toggleNewSetEquipment(opt)}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Exercise Order */}
        <Typography sx={{ mb: 1, fontWeight: 600 }} variant="subtitle2">
          Exercise Order (drag to reorder)
        </Typography>

        {variant.exerciseOrder.map((ex, idx) => (
          <Box
            key={idx}
            draggable
            onDragStart={() => setDragIndex(idx)}
            onDragOver={(e) => {
              e.preventDefault()
              setHoverIndex(idx)
            }}
            onDrop={() => {
              if (dragIndex === null || dragIndex === idx) return
              const newOrder = [...variant.exerciseOrder]
              const [moved] = newOrder.splice(dragIndex, 1)
              newOrder.splice(idx, 0, moved)
              updateVariant(newOrder)
              setDragIndex(null)
              setHoverIndex(null)
            }}
            sx={{
              mb: 1.5,
              borderRadius: 2,
              display: 'flex',
              border: `1px solid ${hoverIndex === idx ? theme.palette.primary.main : theme.palette.divider
                }`
            }}
          >
            <Box sx={{ px: 1, display: 'flex', alignItems: 'center', borderRight: `1px solid ${theme.palette.divider}` }}>
              <DragIndicatorIcon fontSize="small" />
            </Box>

            <Box sx={{ flex: 1 }}>
              <EditExerciseRow
                exercise={ex}
                equipmentOptions={equipmentOptions}
                onUpdate={(u) => handleUpdateSet(idx, u)}
                onDelete={() => handleDeleteSet(idx)}
              />
            </Box>
          </Box>
        ))}
      </AccordionDetails>

      {/* Edit Name Dialog */}
      <Dialog open={variantNameDialog} onClose={() => setVariantNameDialog(false)}>
        <DialogTitle>Edit Variant Name</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Variant Name" value={variantName} onChange={(e) => setVariantName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariantNameDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onUpdate({ ...variant, id: variant.id, variantName })
              setVariantNameDialog(false)
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}
