import React, { useEffect, useState } from 'react'
import { FormControlLabel, Switch, Box, Typography } from '@mui/material'
import { initNotifications, scheduleAllForTasks, cancelAllScheduled } from '../../data/notificationService'
import { getTodoData } from '../../data/todoDataService'

const STORAGE_KEY = 'fittrack.notifications.enabled'

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      return v === 'true'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (enabled) {
      initNotifications().catch(() => null)
      try {
        const db = getTodoData()
        scheduleAllForTasks(db.tasks).catch(() => null)
      } catch (e) {
        // ignore
      }
    } else {
      cancelAllScheduled().catch(() => null)
    }
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
    } catch (e) {}
  }, [enabled])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControlLabel
        control={<Switch checked={enabled} onChange={e => setEnabled(e.target.checked)} />}
        label={<Typography variant="body2">Notifications</Typography>}
      />
    </Box>
  )
}
