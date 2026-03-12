import { Button, Stack } from "@mui/material";
import { useAppTheme } from "../theme/ThemeContext";

export default function ThemeSwitcher() {

  const { setTheme } = useAppTheme();

  return (
    <Stack direction="row" spacing={2}>
      <Button onClick={() => setTheme("apple")}>Apple Glass</Button>
      <Button onClick={() => setTheme("jarvis")}>Jarvis AI</Button>
      <Button onClick={() => setTheme("pokemon")}>Pokemon</Button>
      <Button onClick={() => setTheme("cherry")}>Cherry Blossom</Button>
    </Stack>
  );
}