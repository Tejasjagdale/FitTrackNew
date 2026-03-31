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
    useTheme,
    Stack
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ChecklistIcon from "@mui/icons-material/Checklist";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TodayIcon from "@mui/icons-material/Today";
import FastfoodIcon from '@mui/icons-material/Fastfood';
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
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { label: "Home", icon: <HomeRoundedIcon />, path: "/home" },
        { label: "Tasks", icon: <ChecklistIcon />, path: "/todo" },
        { label: "Variants", icon: <FitnessCenterIcon />, path: "/variant" },
        { label: "Playlists", icon: <TodayIcon />, path: "/workout-playlist" },
        { label: "Progress", icon: <ShowChartIcon />, path: "/progress" },
        { label: "Diet", icon: <FastfoodIcon />, path: "/diet" }
    ];
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
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 1 }}>

                        <Box
                            style={{
                                display: "flex",
                                alignItems: "center",
                                textDecoration: "none",
                                color: "inherit"
                            }}
                        >
                            <img
                                src="/favicon.png"
                                alt="logo"
                                onClick={() => setMenuOpen(true)}
                                style={{ width: 28, height: 28, display: "block" }}
                            />

                            <Typography
                                variant="h6"
                                component="div"
                                color="primary"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: "1rem", sm: "1.15rem" },
                                    letterSpacing: "-0.2px",
                                    ml: 1,
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate("/home")}
                            >
                                FitTrack
                            </Typography>
                        </Box>

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
            <SwipeableDrawer
                anchor="left"
                open={menuOpen}
                onOpen={() => setMenuOpen(true)}
                onClose={() => setMenuOpen(false)}
                disableBackdropTransition={false}
                PaperProps={{
                    sx: {
                        width: 260,
                        background: theme.palette.background.paper,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backdropFilter: "blur(18px)"
                    }
                }}
            >
                {/* HEADER */}
                <Box
                    sx={{
                        p: 2,
                        pb: 3,
                        background: `linear-gradient(135deg,
        ${theme.palette.primary.light}22,
        ${theme.palette.primary.dark}22)`,
                        borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 36,
                                height: 36,
                                fontWeight: 700
                            }}
                        >
                            F
                        </Avatar>

                        <Box>
                            <Typography fontWeight={700}>FitTrack</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                Fitness Progress Tracker
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Divider />

                {/* MENU */}
                <Box sx={{ p: 1.2 }}>
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <Box
                                key={item.label}
                                onClick={() => {
                                    navigate(item.path);
                                    setMenuOpen(false);
                                }}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    px: 1.6,
                                    py: 1.2,
                                    mb: 0.4,
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    transition: "all .2s",

                                    background: active
                                        ? `${theme.palette.primary.main}18`
                                        : "transparent",

                                    color: active
                                        ? theme.palette.primary.main
                                        : theme.palette.text.primary,

                                    "&:hover": {
                                        background: theme.palette.action.hover,
                                        transform: "translateX(4px)"
                                    }
                                }}
                            >
                                <Box sx={{ color: theme.palette.primary.main }}>
                                    {item.icon}
                                </Box>

                                <Typography
                                    sx={{
                                        fontWeight: active ? 600 : 500,
                                        fontSize: 14
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </SwipeableDrawer>
            <Container sx={{ mt: 0, mb: 1 , padding: 0 }}>{children}</Container>

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
