import React from 'react'
import { AppBar, Toolbar, Typography, Container, Button, IconButton, Tooltip, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useThemeMode } from '../ThemeModeProvider'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { mode, toggleMode } = useThemeMode()

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25))',
                    boxShadow: 'none',
                    borderBottom: (t) =>
                        `1px solid ${t.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(0,0,0,0.06)'
                        }`,
                    backdropFilter: 'blur(6px)'
                }}
            >
                <Toolbar sx={{ gap: 1, px: { xs: 1, sm: 2 } }}>
                    {/* Logo + Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
                        <RouterLink
                            to="/"
                            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                        >
                            <img
                                src="/favicon.png"
                                alt="logo"
                                style={{ width: 28, height: 28, display: 'block' }}
                            />
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 },
                                    transition: 'opacity 200ms',
                                    ml: 1
                                }}
                            >
                                fitTrack
                            </Typography>
                        </RouterLink>
                    </Box>

                    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                        <IconButton
                            color="inherit"
                            onClick={toggleMode}
                            sx={{ ml: 1 }}
                            aria-label="toggle theme"
                        >
                            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>


            <Container sx={{ mt: 4, mb: 6 }}>{children}</Container>
        </>
    )
}
