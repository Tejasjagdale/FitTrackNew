import {
  Paper,
  Stack,
  Typography,
  IconButton,
  Box
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

  if (!groups.length) {
    return (
      <Typography sx={{ opacity: 0.6 }}>
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
            ...premiumSurface,
            px: 1.5,
            py: 1.2,
            borderRadius: 3,

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            position: "relative",
            overflow: "hidden",

            transition: "all .25s ease",

            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.35)"
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
              background:
                "linear-gradient(#00ffa6,#0b8f62)"
            }}
          />

          {/* LEFT CONTENT */}
          <Stack direction="row" alignItems="center" spacing={1.2} sx={{ pl: 1 }}>
            <GroupsIcon
              sx={{
                fontSize: 18,
                opacity: 0.7,
                color: "#00ffa6"
              }}
            />

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 14,
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
              background: "rgba(255,255,255,0.05)",
              borderRadius: 2,
              px: 0.5
            }}
          >
            <IconButton
              size="small"
              onClick={() => onDelete(g.id)}
              sx={{
                color: "rgba(255,100,100,0.85)",
                "&:hover": {
                  background: "rgba(255,80,80,0.12)"
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
