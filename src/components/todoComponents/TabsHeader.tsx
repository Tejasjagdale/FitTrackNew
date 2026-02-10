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
        background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.04) 0%, rgba(52, 168, 224, 0.04) 100%)',
        border: '1px solid rgba(66, 133, 244, 0.1)',
        borderRadius: 1.5,
        px: { xs: 0.5, sm: 1 },
        py: 0.5
      }}
    >
      <Tabs
        value={value}
        onChange={(_, v) => onChange(v)}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        TabIndicatorProps={{
          style: {
            height: 2,
            borderRadius: 1,
            background: '#4285f4'
          }
        }}
        sx={{
          minHeight: { xs: 44, sm: 48 }
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

function renderTab(label: string, active: boolean) {
  return (
    <Tab
      label={label}
      disableRipple
      sx={{
        minHeight: { xs: 44, sm: 48 },
        px: { xs: 1.75, sm: 2.5 },
        fontSize: { xs: "0.8rem", sm: "0.9rem" },
        fontWeight: active ? 700 : 600,
        textTransform: "none",
        borderRadius: 1,
        whiteSpace: "nowrap",
        color: active ? '#4285f4' : 'rgba(0, 0, 0, 0.6)',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          color: '#4285f4',
          background: "rgba(66, 133, 244, 0.08)"
        },
        "&.Mui-selected": {
          color: '#4285f4'
        }
      }}
    />
  );
}
