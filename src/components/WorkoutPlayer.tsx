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

/* ===== ADD: helpers ===== */
function extractSeconds(reps?: string): number | null {
    if (!reps) return null
    const m = reps.match(/(\d+)\s*sec/i)
    return m ? Number(m[1]) : null
}

const horn = new Audio('/sounds/bell.mp3')
horn.volume = 0.6
/* ======================= */

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

    /* ===== ADD: timer state ===== */
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [timerTotal, setTimerTotal] = useState(0)
    /* =========================== */

    const nextStep = variant.exerciseOrder[currentStepIndex + 1] || null
    const timedSeconds = extractSeconds(currentStep?.reps)

    /* ===== EXISTING REST TIMER + SOUND ===== */
    useEffect(() => {
        if (!isResting || timeLeft <= 0) return
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)

        if (timeLeft === 1) {
            horn.play()              // 🔊 rest over
            handleNextStep(true)
        }

        return () => clearTimeout(timer)
    }, [isResting, timeLeft])
    /* ===================================== */

    /* ===== ADD: TIMED EXERCISE TIMER ===== */
    useEffect(() => {
        if (!isTimerRunning || timeLeft <= 0) return

        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)

        if (timeLeft === 1) {
            horn.play()              // 🔊 timer end
            setIsTimerRunning(false)
            startRest()              // ⬅ existing logic
        }

        return () => clearTimeout(timer)
    }, [isTimerRunning, timeLeft])
    /* ===================================== */

    if (!currentStep) return null

    const startRest = () => {
        setIsResting(true)
        setTimeLeft(currentStep.restSeconds)
    }

    const handleCompleteSet = () => startRest()

    /* ===== ADD: start timed exercise ===== */
    const handleStartTimer = () => {
        if (!timedSeconds) return
        const total = 10 + timedSeconds   // 10s prep + work
        setTimerTotal(total)
        setTimeLeft(total)
        setIsTimerRunning(true)
    }
    /* ==================================== */

    const handleNextStep = (_fromRest = false) => {
        setIsResting(false)
        setIsTimerRunning(false)
        setTimeLeft(0)

        const nextIndex = currentStepIndex + 1
        if (nextIndex < variant.exerciseOrder.length) {
            onStepComplete(nextIndex)
        } else {
            onFinishWorkout(true)
        }
    }

    const handleUndoStep = () => {
        setIsResting(false)
        setIsTimerRunning(false)
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
        <Card sx={{
            p: 4,
            textAlign: 'center',
            mb: 3,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
        }}>

            {/* --- EQUIPMENT --- */}
            {!isResting && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5, fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Equipment
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                        {currentStep.equipment?.map(item => (
                            <Chip
                                key={item}
                                label={item}
                                sx={{
                                    mb: 0.5,
                                    height: 28,
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    background: 'linear-gradient(135deg, rgba(66,133,244,0.15) 0%, rgba(52,168,224,0.1) 100%)',
                                    border: '1px solid rgba(66,133,244,0.3)',
                                    color: 'text.primary'
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}

            {/* ACTIVE EXERCISE */}
            {!isResting && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600 }}>
                                Progress
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                {currentStepIndex + 1}/{variant.exerciseOrder.length}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                borderRadius: 20,
                                height: 7,
                                background: 'rgba(255,255,255,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 20,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                                }
                            }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            mb: 2.5,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        {currentStep.name}
                    </Typography>

                    {/* ADDITIVE: timer display only when running */}
                    {isTimerRunning && (
                        <Box sx={{ mb: 2.5 }}>
                            <TimerCircle timeLeft={timeLeft} totalTime={timerTotal} />
                        </Box>
                    )}

                    <Stack spacing={1.5} sx={{ mb: 3.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 1.5,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.primary.main}10 100%)`,
                                border: `1.5px solid ${theme.palette.primary.main}40`,
                                minWidth: 90
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    Set {currentStep.set}
                                </Typography>
                            </Box>
                            <Box sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 1.5,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1.5px solid rgba(255,255,255,0.15)',
                                minWidth: 90
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    {currentStep.reps}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    {/* BUTTONS */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={handleCompleteSet}
                            sx={{
                                borderRadius: 1.5,
                                px: 3.5,
                                py: 1.2,
                                textTransform: 'none',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${theme.palette.primary.main}60`
                                }
                            }}
                        >
                            Complete Set
                        </Button>

                        {timedSeconds && !isTimerRunning && (
                            <Button
                                variant="outlined"
                                size="medium"
                                onClick={handleStartTimer}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 3.5,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    border: `1.5px solid ${theme.palette.primary.main}40`,
                                    color: 'text.primary',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: `${theme.palette.primary.main}15`,
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Start Timer
                            </Button>
                        )}

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleUndoStep}
                                size="medium"
                                sx={{
                                    borderRadius: 1.5,
                                    px: 3,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    color: 'text.secondary',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.08)',
                                        transform: 'translateY(-2px)'
                                    }
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
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2, fontWeight: 600, letterSpacing: '0.5px' }}>
                        RECOVER
                    </Typography>

                    {/* NEXT EXERCISE PREVIEW */}
                    {nextStep && (
                        <Box
                            sx={{
                                mb: 2.5,
                                p: 3,
                                borderRadius: 2,
                                width: '100%',
                                maxWidth: '300px',
                                mx: 'auto',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(66,133,244,0.1) 0%, rgba(52,168,224,0.05) 100%)',
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                border: '1px solid rgba(66,133,244,0.25)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Next Exercise
                            </Typography>

                            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.3rem', my: 0.8, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {nextStep.name}
                            </Typography>

                            <Typography variant="caption" sx={{ opacity: 0.85, mb: 1, display: 'block', fontWeight: 500 }}>
                                Set {nextStep.set} • {nextStep.reps}
                            </Typography>

                            {nextStep.equipment && nextStep.equipment.length > 0 && (
                                <Stack direction="row" spacing={0.75} justifyContent="center" sx={{ mt: 1 }}>
                                    {nextStep.equipment.map(item => (
                                        <Chip
                                            key={item}
                                            label={item}
                                            size="small"
                                            sx={{
                                                fontSize: '0.7rem',
                                                height: 22,
                                                background: 'rgba(255,255,255,0.15)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                fontWeight: 600
                                            }}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => adjustTime(-10)}
                            sx={{
                                borderRadius: 1,
                                minWidth: 50,
                                border: '1.5px solid rgba(255,255,255,0.15)',
                                transition: 'all 0.2s ease',
                                '&:hover': { background: 'rgba(255,255,255,0.08)' }
                            }}
                        >
                            -10s
                        </Button>

                        <TimerCircle timeLeft={timeLeft} totalTime={currentStep.restSeconds} />

                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => adjustTime(10)}
                            sx={{
                                borderRadius: 1,
                                minWidth: 50,
                                border: '1.5px solid rgba(255,255,255,0.15)',
                                transition: 'all 0.2s ease',
                                '&:hover': { background: 'rgba(255,255,255,0.08)' }
                            }}
                        >
                            +10s
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => handleNextStep(true)}
                            sx={{
                                borderRadius: 1.5,
                                px: 3,
                                py: 1.2,
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                boxShadow: `0 4px 15px ${theme.palette.success.main}40`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 20px ${theme.palette.success.main}60`
                                }
                            }}
                        >
                            Next Set
                        </Button>

                        {currentStepIndex > 0 && (
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleUndoStep}
                                sx={{
                                    borderRadius: 1.5,
                                    px: 2.5,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.08)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Undo
                            </Button>
                        )}
                    </Box>
                </>
            )}

            <Button
                variant="text"
                onClick={() => onFinishWorkout(false)}
                sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    mt: 1,
                    color: 'error.main',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        background: 'rgba(211, 47, 47, 0.08)',
                        transform: 'translateY(-1px)'
                    }
                }}
            >
                End Workout Early
            </Button>
        </Card>
    )
}
