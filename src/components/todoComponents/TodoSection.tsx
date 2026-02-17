import {
  Stack,
  Paper,
  Typography,
  Chip
} from "@mui/material";

import { Todo, Group } from "../../types/todoModels";

interface Props {
  todos: Todo[];
  groups: Group[];
  onEdit: (t: Todo) => void;
}

export default function TodoSection({
  todos,
  groups,
  onEdit
}: Props) {
  const getGroup = (id: string) =>
    groups.find(g => g.id === id)?.name;

  return (
    <Stack spacing={1.5}>
      {todos.map(t => (
        <Paper
          key={t.id}
          sx={{ p: 1.5, cursor: "pointer" }}
          onClick={() => onEdit(t)}
        >
          <Typography fontWeight={600}>
            {t.title}
          </Typography>

          <Stack direction="row" spacing={1} mt={1}>
            {t.groupIds.map(id => (
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
