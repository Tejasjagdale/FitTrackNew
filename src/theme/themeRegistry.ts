import { appleLiquidGlass } from "./themes/appleLiquidGlass";
import { aiJarvis } from "./themes/aiJarvis";
import { pokemon } from "./themes/pokemon";
import { cherryBlossom } from "./themes/cherryBlossom";

export const themes = {
  apple: appleLiquidGlass,
  jarvis: aiJarvis,
  pokemon: pokemon,
  cherry: cherryBlossom
};

export type ThemeKey = keyof typeof themes;