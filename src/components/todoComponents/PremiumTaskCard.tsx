import {
  Paper,
  Stack,
  Typography,
  Checkbox,
  Box,
  Chip,
  IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function PremiumTaskCard({
  title,
  done,
  meta,
  onToggle,
  onEdit,
  groups = [],
  groupIds = []
}: any) {

  const groupLabels = groups.filter((g: any) =>
    groupIds.includes(g.id)
  );

  return (
    <Paper
      elevation={0}
      sx={{
        px: 2,
        py: 1.2,
        borderRadius: 2,
        background: "#0c1411",
        border: "1px solid rgba(0,255,170,0.15)"
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2}>

        <Checkbox
          checked={done}
          onChange={onToggle}
          sx={{ p: .4 }}
        />

        <Box sx={{ flex: 1 }}>

          <Typography
            sx={{
              fontWeight: 600,
              fontSize: ".95rem",
              opacity: done ? 0.5 : 1
            }}
          >
            {title}
          </Typography>

          {/* META + GROUP CHIPS INLINE */}
          <Stack
            direction="row"
            spacing={0.6}
            alignItems="center"
            mt={0.4}
            flexWrap="wrap"
          >

            {meta && (
              <Chip
                size="small"
                icon={<AccessTimeIcon sx={{ fontSize: 14 }} />}
                label={meta}
                sx={{
                  height: 18,
                  fontSize: 10,
                  background: "rgba(0,255,170,0.18)"
                }}
              />
            )}

            {groupLabels.map((g: any) => (
              <Chip
                key={g.id}
                size="small"
                label={g.name}
                sx={{
                  height: 18,
                  fontSize: 10,
                  background: "rgba(0,255,170,0.08)"
                }}
              />
            ))}

          </Stack>

        </Box>

        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>

      </Stack>
    </Paper>
  );
}
