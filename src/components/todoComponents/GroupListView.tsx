import {
  Paper,
  Stack,
  Typography,
  IconButton,
  Box,
  useTheme
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";

import { Group } from "../../types/todoModels";
import { premiumSurface } from "../../types/todoModels";

interface Props {
  groups: Group[];
  onDelete: (id: string) => void;
}

export default function GroupListView({ groups, onDelete }: Props) {
  const theme = useTheme();

  if (!groups.length) {
    return (
      <Typography
        sx={{
          opacity: 0.7,
          color: theme.palette.text.secondary,
          fontSize: 13
        }}
      >
        No groups created yet
      </Typography>
    );
  }

  return (
    <Stack spacing={1.2}>
      {groups.map(g => (
        <Paper
          key={g.id}
          sx={{
            ...premiumSurface(theme),

            px: { xs: 1.4, sm: 1.6 },
            py: { xs: 1.1, sm: 1.2 },

            borderRadius: 2.5,

            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            position: "relative",
            overflow: "hidden",

            transition: "all .25s ease",

            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 10px 30px rgba(0,0,0,0.55)"
                  : "0 6px 20px rgba(0,0,0,0.08)"
            }
          }}
        >
          {/* LEFT ACCENT BAR */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 10,
              bottom: 10,
              width: 3,
              borderRadius: 2,
              background: `linear-gradient(
  ${theme.palette.primary.main},
  ${theme.palette.primary.dark}
)`
            }}
          />

          {/* LEFT CONTENT */}
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ pl: 1 }}>
            <GroupsIcon
              sx={{
                fontSize: { xs: 18, sm: 20 },
                opacity: 0.7,
                color: theme.palette.primary.main
              }}
            />

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: 13, sm: 14 },
                color: theme.palette.text.primary,
                letterSpacing: "-0.2px"
              }}
            >
              {g.name}
            </Typography>
          </Stack>

          {/* ACTIONS */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: theme.palette.action.hover,
              borderRadius: 2,
              px: 0.5
            }}
          >
            <IconButton
              size="small"
              onClick={() => onDelete(g.id)}
              sx={{
                color: theme.palette.error.main,

                "&:hover": {
                  background: `${theme.palette.error.main}15`
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
