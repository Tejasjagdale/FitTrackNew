import React from 'react'
import { AppBar, Toolbar, Typography, Container, Button, IconButton, Tooltip, Menu, MenuItem } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SettingsIcon from '@mui/icons-material/Settings'
import { useThemeMode } from '../ThemeModeProvider'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { mode, toggleMode } = useThemeMode()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.25))',
          boxShadow: 'none',
          borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)'}`,
          backdropFilter: 'blur(6px)'
        }}
      >
        <Toolbar sx={{ gap: 1, px: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
              transition: 'opacity 200ms'
            }}
          >
            <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              fitTrack
            </RouterLink>
          </Typography>
          <Button color="inherit" component={RouterLink} to="/today">
            Today's Workout
          </Button>
          <Button color="inherit" component={RouterLink} to="/variant">
            Variant
          </Button>

          <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton color="inherit" onClick={toggleMode} sx={{ ml: 1 }} aria-label="toggle theme">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="More options">
            <IconButton color="inherit" onClick={handleMenuOpen} aria-label="more">
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
              Settings
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 6 }}>{children}</Container>
    </>
  )
}
