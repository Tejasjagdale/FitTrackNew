// src/layout/Layout.tsx
import React, { useState, useEffect } from 'react'
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    IconButton,
    Tooltip,
    Box
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

import { useThemeMode } from '../ThemeModeProvider'
import { ProfileDialog } from './progressComponents/ProfileDialog'

import {
    loadProgressData,
    setProgressData,
    syncProgressToGitHub
} from '../data/progressDataService'

import { ProfileData, ProgressDataFile } from '../data/progressTypes'
import { isGitHubConfigured } from '../data/githubService'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { mode, toggleMode } = useThemeMode()

    const [profileDialogOpen, setProfileDialogOpen] = useState(false)
    const [profile, setProfile] = useState<ProfileData>({})
    const [cachedData, setCachedData] = useState<ProgressDataFile | null>(null)

    const hasGitHubToken = isGitHubConfigured()

    /* ----------------------------------------------------------
       LOAD progress.json (profile + all data)
    ---------------------------------------------------------- */
    useEffect(() => {
        loadProgressData()
            .then((data) => {
                if (data) {
                    setCachedData(data)
                    setProfile(data.profile || {})
                }
            })
            .catch((err) => console.error('Failed to load profile:', err))
    }, [])

    /* ----------------------------------------------------------
       SAVE + AUTO-SYNC TO GITHUB
    ---------------------------------------------------------- */
    const handleSaveProfile = async (updated: ProfileData) => {
        if (!cachedData) return

        const newData: ProgressDataFile = {
            ...cachedData,
            profile: updated
        }

        // Update UI immediately
        setProfile(updated)
        setCachedData(newData)

        // Save locally
        setProgressData(newData)

        // AUTO-SYNC (only if token exists)
        if (hasGitHubToken) {
            try {
                await syncProgressToGitHub(
                    `Profile update - ${new Date().toLocaleString('en-IN')}`
                )
            } catch (err) {
                console.error('GitHub Sync Failed:', err)
            }
        }

        setProfileDialogOpen(false)
    }

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
                    {/* LOGO + TITLE */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
                        <RouterLink
                            to="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                                color: 'inherit'
                            }}
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
                                FitTrack
                            </Typography>
                        </RouterLink>
                    </Box>

                    {/* THEME SWITCH */}
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

                    {/* PROFILE BUTTON */}
                    <Tooltip title="Edit Profile">
                        <IconButton onClick={() => setProfileDialogOpen(true)}>
                            <AccountCircleIcon fontSize="large" />
                        </IconButton>
                    </Tooltip>


                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4, mb: 6 }}>{children}</Container>

            {/* PROFILE DIALOG */}
            <ProfileDialog
                open={profileDialogOpen}
                initial={profile}
                onClose={() => setProfileDialogOpen(false)}
                onSave={handleSaveProfile}
            />
        </>
    )
}
