import React, { useState, useEffect } from 'react'
import {
    Card,
    Box,
    Chip,
    LinearProgress,
    Button,
    Typography,
    Stack,
    useTheme
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Variant } from '../data/workoutUtils'
import TimerCircle from './TimerCircle'

interface Props {
    variant: Variant
    currentStepIndex: number
    onStepComplete: (nextIndex: number) => void
    onUndo: (prevIndex: number) => void
    onFinishWorkout: (completedFully: boolean) => void
}

export default function WorkoutPlayer({
    variant,
    currentStepIndex,
    onStepComplete,
    onUndo,
    onFinishWorkout
}: Props) {
    const theme = useTheme()
    const currentStep = variant.exerciseOrder[currentStepIndex] || null

    const [timeLeft, setTimeLeft] = useState(0)
    const [isResting, setIsResting] = useState(false)

    useEffect(() => {
        if (!isResting || timeLeft <= 0) return
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)

        // When timer hits zero → auto next step
        if (timeLeft === 1) handleNextStep(true)

        return () => clearTimeout(timer)
    }, [isResting, timeLeft])

    if (!currentStep) return null

    const startRest = () => {
        setIsResting(true)
        setTimeLeft(currentStep.restSeconds)
    }

    const handleCompleteSet = () => startRest()

    const handleNextStep = (fromRest = false) => {
        setIsResting(false)
        setTimeLeft(0)

        const nextIndex = currentStepIndex + 1
        const total = variant.exerciseOrder.length

        if (nextIndex < total) {
            onStepComplete(nextIndex)
        } else {
            // LAST STEP COMPLETED FULLY
            onFinishWorkout(true)
        }
    }

    const handleUndoStep = () => {
        setIsResting(false)
        setTimeLeft(0)

        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) onUndo(prevIndex)
    }

    const adjustTime = (delta: number) => {
        setTimeLeft(t => Math.max(0, t + delta))
    }

    const progress =
        ((currentStepIndex + 1) / variant.exerciseOrder.length) * 100

    return (
        <Card sx={{ p: 4, textAlign: 'center', mb: 3, borderRadius: 3 }}>
            {/* --- EQUIPMENT SECTION --- */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Equipment Needed:
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                    {currentStep.equipment?.map(item => (
                        <Chip
                            key={item}
                            label={item}
                            color="secondary"
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* ACTIVE EXERCISE */}
            {!isResting && (
                <>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mb: 2, borderRadius: 2, height: 6 }}
                    />

                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Step {currentStepIndex + 1} of {variant.exerciseOrder.length}
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}
                    >
                        {currentStep.name}
                    </Typography>

                    <Stack spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Chip label={`Set ${currentStep.set}`} color="primary" variant="filled" />
                            <Chip label={`${currentStep.reps} reps`} variant="outlined" />
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, mb: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleCompleteSet}
                            sx={{ borderRadius: 2, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
                        >
                            Complete Set
                        </Button>

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleUndoStep}
                                sx={{ borderRadius: 2, textTransform: 'none' }}
                            >
                                Undo
                            </Button>
                        )}
                    </Box>
                </>
            )}

            {/* REST TIMER */}
            {isResting && (
                <>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                        Rest before next set
                    </Typography>

                    <TimerCircle timeLeft={timeLeft} totalTime={currentStep.restSeconds} />

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, mt: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => adjustTime(-10)}>
                            -10s
                        </Button>
                        <Button size="small" variant="outlined" onClick={() => adjustTime(10)}>
                            +10s
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2, mb: 2 }}>
                        <Button variant="outlined" onClick={() => handleNextStep(true)} sx={{ borderRadius: 2 }}>
                            Skip Rest
                        </Button>

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleUndoStep}
                                sx={{ borderRadius: 2 }}
                            >
                                Undo
                            </Button>
                        )}
                    </Box>
                </>
            )}

            {/* FINISH WORKOUT EARLY → PARTIAL */}
            <Button
                variant="contained"
                color="error"
                onClick={() => onFinishWorkout(false)}
                sx={{ borderRadius: 2, textTransform: 'none', mt: 1 }}
            >
                Finish Workout
            </Button>
        </Card>
    )
}
