import { Tabs, Tab, Box, useTheme, useMediaQuery } from "@mui/material";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function TabsHeader({ value, onChange }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg,#020617,#020617)",
        borderRadius: 2,

        px: { xs: 0.5, sm: 1 },
        py: 0.5
      }}
    >
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}

        /* Responsive behavior */
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile

        TabIndicatorProps={{
          style: {
            height: 3,
            borderRadius: 2,
            background:
              "linear-gradient(90deg,#38bdf8,#6366f1)"
          }
        }}

        sx={{
          minHeight: { xs: 40, sm: 44 }
        }}
      >
        {renderTab("Pending", value === 0)}
        {renderTab("Completed", value === 1)}
        {renderTab("Streaks", value === 2)}
        {renderTab("Groups", value === 3)}
      </Tabs>
    </Box>
  );
}


/* ================= HELPERS ================= */

function renderTab(label: string, active: boolean) {
  return (
    <Tab
      label={label}
      disableRipple

      sx={{
        minHeight: { xs: 40, sm: 44 },

        px: { xs: 1.5, sm: 2 },

        fontSize: { xs: "0.75rem", sm: "0.85rem" },
        fontWeight: 600,

        textTransform: "none",

        borderRadius: 2,

        whiteSpace: "nowrap",

        color: active ? "#fff" : "rgba(255,255,255,0.6)",

        transition: "all 0.2s ease",

        "&:hover": {
          color: "#fff",
          background: "rgba(255,255,255,0.05)"
        },

        "&.Mui-selected": {
          color: "#fff"
        }
      }}
    />
  );
}
