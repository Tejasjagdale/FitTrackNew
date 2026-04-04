import { callAI } from "../engine/gemini";

export type NutritionResult = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  protein_goal_met: boolean;
  summary: string;
};

export type GoalType = "cut" | "gain";

function buildPrompt(meals: string[]): string {
  return `
You are a strict nutrition calculator.

Meals eaten today:
${meals.map((m) => `- ${m}`).join("\n")}

Rules:
- Estimate calories, protein, carbs, fats
- Be consistent and realistic
- No random guesses

Return ONLY JSON:

{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "protein_goal_met": boolean,
  "summary": "short analysis"
}
`;
}

export async function analyzeMeals(meals: string[], targets: any): Promise<NutritionResult> {
  const prompt = buildPrompt(meals);

  const result = await callAI(prompt);

  // NO parsing here
  return result;
}

export function getLatestWeight(dailyWeight: Record<string, number>): number {
  const sortedDates = Object.keys(dailyWeight).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return dailyWeight[sortedDates[0]];
}

export function calculateNutritionTargets(
  weight: number,
  goalWeight: number
) {
  const isGain = goalWeight > weight;

  const maintenance = weight * 33;

  const targetCalories = isGain
    ? maintenance + 300
    : maintenance - 400;

  const protein = weight * 1.8;
  const fats = weight * 0.8;
  const carbs =
    (targetCalories - (protein * 4 + fats * 9)) / 4;

  return {
    goalType: isGain ? "gain" : "cut",
    maintenanceCalories: Math.round(maintenance),
    targetCalories: Math.round(targetCalories),
    proteinTarget: Math.round(protein),
    fatTarget: Math.round(fats),
    carbTarget: Math.round(carbs),
  };
}