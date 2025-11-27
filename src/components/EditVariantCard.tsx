import React, { useState } from 'react'
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
  useTheme
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { getData } from '../data/dataService'
import type { Variant, ExerciseOrder } from '../data/workoutUtils'
import { EditExerciseRow } from './EditExerciseRow'

interface EditVariantCardProps {
  variant: Variant
  onUpdate: (updated: Variant) => void
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
    const newOrder = variant.exerciseOrder.filter((_:any, i:any) => i !== index)
      .map((ex:any, i:any) => ({ ...ex, step: i + 1 })) // reassign step
    onUpdate({ ...variant, exerciseOrder: newOrder })
  }

  const handleAddSet = () => {
    if (!newExerciseName) return

    const lastSet = variant.exerciseOrder
      .filter((ex:any) => ex.name === newExerciseName)
      .pop()

    const newSet: ExerciseOrder = {
      step: variant.exerciseOrder.length + 1,
      name: newExerciseName,
      set: (lastSet?.set || 0) + 1,
      reps: newSetReps,
      restSeconds: parseInt(newSetRest) || 60,
      equipment: newSetEquipment
    }

    onUpdate({ ...variant, exerciseOrder: [...variant.exerciseOrder, newSet] })

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
              onClick={(e) => { e.stopPropagation(); setVariantNameDialog(true) }}
              size="small"
              title="Edit variant name"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing) }}
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
              <Button startIcon={<AddIcon />} onClick={handleAddSet} variant="contained">Add Set</Button>
            </Stack>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, mt: 2, color: theme.palette.primary.main }}>
              Equipment (select multiple)
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {equipmentOptions.map((opt:any) => (
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

        {/* Render all exercises independently */}
        <Box>
          {variant.exerciseOrder.map((exercise: any, idx:any) => (
            <EditExerciseRow
              key={idx}
              exercise={exercise}
              equipmentOptions={equipmentOptions}
              onUpdate={(updated) => handleUpdateSet(idx, updated)}
              onDelete={() => handleDeleteSet(idx)}
            />
          ))}
        </Box>
      </AccordionDetails>

      {/* Variant Name Dialog */}
      <Dialog open={variantNameDialog} onClose={() => setVariantNameDialog(false)} maxWidth="xs" fullWidth>
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
          <Button onClick={handleUpdateVariantName} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}
