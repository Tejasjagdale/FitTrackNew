import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box
} from "@mui/material";

import FolderIcon from "@mui/icons-material/Folder";

import { Group, Task } from "../../types/todoModels";

interface Props {
  groups: Group[];
  tasks: Task[];
  onSelect: (groupId: string) => void;
}

export default function GroupList({
  groups,
  tasks,
  onSelect
}: Props) {
  return (
    <Stack spacing={2}>
      {groups.map(group => {
        const count = tasks.filter(t =>
          t.groupIds.includes(group.id)
        ).length;

        return (
          <Card
            key={group.id}
            elevation={0}
            onClick={() => onSelect(group.id)}
            sx={{
              borderRadius: 3,
              cursor: "pointer",

              background:
                "linear-gradient(135deg,#1e293b,#0f172a)",

              color: "#fff",

              transition: "all .25s ease",

              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,.4)"
              }
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,.1)"
                  }}
                >
                  <FolderIcon />
                </Box>

                <Box flex={1}>
                  <Typography fontWeight={700}>
                    {group.name}
                  </Typography>

                  <Typography
                    fontSize="0.75rem"
                  >
                    {count} task{count !== 1 && "s"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
