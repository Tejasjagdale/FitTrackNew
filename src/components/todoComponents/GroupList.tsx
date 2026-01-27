import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ================= METRICS ================= */

  const groupStats = groups.map(g => {
    const groupTasks = tasks.filter(t =>
      t.groupIds.includes(g.id)
    );

    const total = groupTasks.length;

    const completed = groupTasks.filter(
      t => t.status === "completed"
    ).length;

    return {
      ...g,
      total,
      completed,
      ratio: total ? completed / total : 0
    };
  });

  const topGroup =
    groupStats.sort((a, b) => b.total - a.total)[0]
      ?.id;

  /* ================= EMPTY ================= */

  if (!groups.length) {
    return (
      <Typography color="text.secondary">
        No groups yet. Create one first.
      </Typography>
    );
  }

  /* ================= RENDER ================= */

  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(auto-fill, minmax(220px,1fr))"
        },

        gap: 2
      }}
    >
      {groupStats.map(group => {
        const isTop = group.id === topGroup;

        return (
          <Card
            key={group.id}
            elevation={0}
            onClick={() => onSelect(group.id)}
            sx={{
              position: "relative",

              height: "100%",

              borderRadius: 3,
              cursor: "pointer",

              background: `
                linear-gradient(
                  135deg,
                  #1e293b,
                  #020617
                )
              `,

              color: "#fff",

              transition: "all .25s ease",

              transform: isTop
                ? "scale(1.03)"
                : "none",

              boxShadow: isTop
                ? "0 0 25px rgba(56,189,248,.5)"
                : "none",

              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow:
                  "0 10px 28px rgba(0,0,0,.5)"
              }
            }}
          >
            {/* ================= TOP TAG ================= */}

            {isTop && !isMobile && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,

                  px: 1,
                  py: 0.2,

                  borderRadius: 2,

                  background:
                    "linear-gradient(90deg,#38bdf8,#6366f1)",

                  fontSize: "0.55rem",

                  fontWeight: 700,

                  color: "#020617",

                  textTransform: "uppercase"
                }}
              >
                Primary
              </Box>
            )}

            <CardContent sx={{ pb: "16px!important" }}>
              <Stack spacing={1.5}>

                {/* ================= HEADER ================= */}

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",

                      background:
                        "linear-gradient(135deg,#0f172a,#1e293b)"
                    }}
                  >
                    <FolderIcon
                      sx={{ color: "#38bdf8" }}
                    />
                  </Box>

                  <Box flex={1} minWidth={0}>
                    <Typography
                      fontWeight={700}
                      noWrap
                    >
                      {group.name}
                    </Typography>

                    <Typography
                      fontSize="0.7rem"
                      color="rgba(255,255,255,.6)"
                    >
                      {group.total} task
                      {group.total !== 1 && "s"}
                    </Typography>
                  </Box>
                </Stack>

                {/* ================= PROGRESS ================= */}

                {group.total > 0 && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={group.ratio * 100}
                      sx={{
                        height: 6,

                        borderRadius: 3,

                        background:
                          "rgba(255,255,255,.1)",

                        "& .MuiLinearProgress-bar": {
                          background:
                            "linear-gradient(90deg,#38bdf8,#6366f1)"
                        }
                      }}
                    />

                    {!isMobile && (
                      <Typography
                        mt={0.3}
                        fontSize="0.6rem"
                        color="rgba(255,255,255,.6)"
                      >
                        {group.completed} /{" "}
                        {group.total} completed
                      </Typography>
                    )}
                  </Box>
                )}

              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
