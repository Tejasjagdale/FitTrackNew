import { Tabs, Tab } from "@mui/material";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function TabsHeader({ value, onChange }: Props) {
  return (
    <Tabs value={value} onChange={(_, v) => onChange(v)}>
      <Tab label="Pending" />
      <Tab label="Completed" />
      <Tab label="Streaks" />
      <Tab label="Groups" />
    </Tabs>
  );
}
