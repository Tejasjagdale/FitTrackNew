import {
  Stack,
  Paper,
  Typography,
  Chip
} from "@mui/material";

import { Routine, Group } from "../../types/todoModels";

interface Props {
  routines: Routine[];
  groups: Group[];
  onEdit: (r: Routine) => void;
}

export default function RoutineSection({
  routines,
  groups,
  onEdit
}: Props) {
  const getGroup = (id: string) =>
    groups.find(g => g.id === id)?.name;

  return (
    <Stack spacing={1.5}>
      {routines.map(r => (
        <Paper
          key={r.id}
          sx={{ p: 1.5, cursor: "pointer" }}
          onClick={() => onEdit(r)}
        >
          <Typography fontWeight={600}>
            {r.title}
          </Typography>

          <Stack direction="row" spacing={1} mt={1}>
            {r.groupIds.map(id => (
              <Chip
                key={id}
                label={getGroup(id)}
                size="small"
              />
            ))}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
