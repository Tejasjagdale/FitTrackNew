// src/layout/Layout.tsx
import React, { useState, useEffect } from 'react'
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    IconButton,
    Tooltip,
    Box,
    useTheme
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

import { ProfileDialog } from './progressComponents/ProfileDialog'

import {
    loadProgressData,
    setProgressData,
    syncProgressToGitHub
} from '../data/progressDataService'

import { ProfileData, ProgressDataFile } from '../data/progressTypes'
import { isGitHubConfigured } from '../data/githubService'

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Fab } from "@mui/material";
import { useNavigate } from "react-router-dom";


export default function Layout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const [profileDialogOpen, setProfileDialogOpen] = useState(false)
    const [profile, setProfile] = useState<ProfileData>({})
    const [cachedData, setCachedData] = useState<ProgressDataFile | null>(null)

    const hasGitHubToken = isGitHubConfigured()
    const theme = useTheme();

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
            <Fab
                size="small"
                onClick={() => navigate("/")}
                sx={{
                    position: "fixed",
                    bottom: { xs: 18, sm: 24 },
                    right: { xs: 16, sm: 20 },
                    zIndex: 2000,

                    background: `linear-gradient(
      135deg,
      ${theme.palette.primary.light},
      ${theme.palette.primary.dark}
    )`,

                    color: theme.palette.getContrastText(theme.palette.primary.main),

                    boxShadow: `0 8px 25px ${theme.palette.primary.main}45`,

                    transition: "all 0.25s ease",

                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 30px ${theme.palette.primary.main}70`
                    }
                }}
            >
                <HomeRoundedIcon fontSize="small" />
            </Fab>
            <AppBar
                position="sticky"
                sx={{
                    background: theme.palette.background.paper,

                    backdropFilter: "blur(14px)",

                    borderBottom: `1px solid ${theme.palette.divider}`,

                    boxShadow:
                        theme.palette.mode === "dark"
                            ? "0 8px 30px rgba(0,0,0,0.45)"
                            : "0 4px 12px rgba(0,0,0,0.08)"
                }}
            >
                <Toolbar
                    sx={{
                        gap: 1,
                        px: { xs: 1.5, sm: 2.5 },
                        minHeight: { xs: 56, sm: 64 }
                    }}
                >
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

                                    fontSize: {
                                        xs: "1rem",
                                        sm: "1.15rem"
                                    },

                                    letterSpacing: "-0.2px",

                                    transition: "opacity 200ms",

                                    "&:hover": { opacity: 0.85 },

                                    ml: 1
                                }}
                            >
                                FitTrack
                            </Typography>
                        </RouterLink>
                    </Box>

                    {/* PROFILE BUTTON */}
                    <Tooltip title="Edit Profile">
                        <IconButton
                            onClick={() => setProfileDialogOpen(true)}
                            sx={{
                                borderRadius: 2,

                                border: `1px solid ${theme.palette.divider}`,

                                background: theme.palette.background.default,

                                transition: "all 0.2s ease",

                                "&:hover": {
                                    background: theme.palette.action.hover
                                }
                            }}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    </Tooltip>


                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 0, mb: 1 }}>{children}</Container>

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
