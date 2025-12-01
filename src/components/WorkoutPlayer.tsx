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

    const nextStep = variant.exerciseOrder[currentStepIndex + 1] || null

    useEffect(() => {
        if (!isResting || timeLeft <= 0) return
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)

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

            {/* --- EQUIPMENT --- */}
            {!isResting && (
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
            )}

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
                        sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}
                    >
                        {currentStep.name}
                    </Typography>

                    {/* Bigger, more visible chips */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <Chip
                                label={`Set ${currentStep.set}`}
                                color="primary"
                                variant="filled"
                                sx={{
                                    fontSize: 18,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 700
                                }}
                            />

                            <Chip
                                label={`${currentStep.reps} reps`}
                                variant="outlined"
                                sx={{
                                    fontSize: 18,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                    fontWeight: 700
                                }}
                            />
                        </Box>
                    </Stack>

                    {/* Smaller action buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 2 }}>
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleCompleteSet}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                fontSize: 15,
                                fontWeight: 600
                            }}
                        >
                            Complete Set
                        </Button>

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleUndoStep}
                                size="medium"
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    textTransform: 'none',
                                    fontSize: 14
                                }}
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

                    {/* NEXT EXERCISE PREVIEW — GLASS MORPH */}
                    {nextStep && (
                        <Box
                            sx={{
                                mb: 3,
                                p: 2.5,
                                borderRadius: '20px',
                                width: '260px',
                                mx: 'auto',
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.12)',
                                backdropFilter: 'blur(18px)',
                                WebkitBackdropFilter: 'blur(18px)',
                                border: '1px solid rgba(255, 255, 255, 0.28)',
                                boxShadow: `
                0 8px 28px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                inset 0 0 25px 12px rgba(255, 255, 255, 0.25)
            `,
                                position: 'relative',
                                overflow: 'hidden',

                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '1px',
                                    height: '100%',
                                    background:
                                        'linear-gradient(180deg, rgba(255,255,255,0.8), transparent, rgba(255,255,255,0.2))',
                                }
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{ opacity: 0.7, fontSize: 14, mb: 0.5 }}
                            >
                                Next:
                            </Typography>

                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: 22,
                                    mb: 1,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                                }}
                            >
                                {nextStep.name}
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    opacity: 0.9,
                                    mb: 1,
                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                }}
                            >
                                Set {nextStep.set} — {nextStep.reps} reps
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                                sx={{ mt: 0.5 }}
                            >
                                {nextStep.equipment?.map(item => (
                                    <Chip
                                        key={item}
                                        label={item}
                                        size="small"
                                        sx={{
                                            fontSize: 12,
                                            color: 'white',
                                            background: 'rgba(255,255,255,0.2)',
                                            border: '1px solid rgba(255,255,255,0.4)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    )}


                    {/* TIMER WITH CONTROLS LEFT & RIGHT */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            mb: 2
                        }}
                    >
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => adjustTime(-10)}
                            sx={{ minWidth: 60 }}
                        >
                            -10s
                        </Button>

                        <TimerCircle timeLeft={timeLeft} totalTime={currentStep.restSeconds} />

                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => adjustTime(10)}
                            sx={{ minWidth: 60 }}
                        >
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


            {/* FINISH EARLY */}
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
