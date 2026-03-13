import { Box, Tabs, Tab } from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import CheckIcon from "@mui/icons-material/Checklist";
import RepeatIcon from "@mui/icons-material/Repeat";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import GroupsIcon from "@mui/icons-material/Groups";

export default function TodoTabs({
  tab,
  handleTabChange,
  isMobile,
  theme
}: any) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2
      }}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="standard"
        sx={{
          minHeight: 36,
          px: 0.5,

          borderRadius: 2,

          background: theme.palette.background.paper,

          backdropFilter: "blur(14px)",

          border: `1px solid ${theme.palette.divider}`,

          "& .MuiTabs-flexContainer": {
            gap: { xs: "2px", sm: "6px" },
            justifyContent: "space-between"
          },

          "& .MuiTabs-indicator": {
            height: 2,
            borderRadius: 2,
            background: theme.palette.primary.main
          }
        }}
      >
        <Tab
          disableRipple
          icon={<HomeIcon sx={{ fontSize: 20 }} />}
          sx={{
            minWidth: isMobile ? 40 : 64,
            minHeight: 34,

            borderRadius: 999,

            "& .MuiTab-iconWrapper": {
              margin: 0
            },

            "&.Mui-selected": {
              color: theme.palette.primary.main
            }
          }}
        />

        <Tab
          disableRipple
          icon={<CheckIcon sx={{ fontSize: 20 }} />}
          sx={{
            minWidth: isMobile ? 40 : 64,
            minHeight: 34,

            borderRadius: 999,

            "& .MuiTab-iconWrapper": {
              margin: 0
            },

            "&.Mui-selected": {
              color: theme.palette.primary.main
            }
          }}
        />

        <Tab
          disableRipple
          icon={<RepeatIcon sx={{ fontSize: 20 }} />}
          sx={{
            minWidth: isMobile ? 40 : 64,
            minHeight: 34,

            borderRadius: 999,

            "& .MuiTab-iconWrapper": {
              margin: 0
            },

            "&.Mui-selected": {
              color: theme.palette.primary.main
            }
          }}
        />

        <Tab
          disableRipple
          icon={<DoneAllIcon sx={{ fontSize: 20 }} />}
          sx={{
            minWidth: isMobile ? 40 : 64,
            minHeight: 34,

            borderRadius: 999,

            "& .MuiTab-iconWrapper": {
              margin: 0
            },

            "&.Mui-selected": {
              color: theme.palette.primary.main
            }
          }}
        />

        <Tab
          disableRipple
          icon={<GroupsIcon sx={{ fontSize: 20 }} />}
          sx={{
            minWidth: isMobile ? 40 : 64,
            minHeight: 34,

            borderRadius: 999,

            "& .MuiTab-iconWrapper": {
              margin: 0
            },

            "&.Mui-selected": {
              color: theme.palette.primary.main
            }
          }}
        />
      </Tabs>
    </Box>
  );
}