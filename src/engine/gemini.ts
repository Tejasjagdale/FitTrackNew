import { ApiResult } from "../types/todoModels";

const DEFAULT_RESULT: ApiResult = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  protein_goal_met: false,
  summary: "Could not analyze meals properly.",
};

/**
 * Extract JSON safely from messy AI output
 */
function extractJSON(text: string): string | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return text.substring(start, end + 1);
  } catch {
    return null;
  }
}

/**
 * Validate structure (VERY IMPORTANT)
 */
function isValidResult(obj: any): obj is ApiResult {
  return (
    obj &&
    typeof obj.calories === "number" &&
    typeof obj.protein === "number" &&
    typeof obj.carbs === "number" &&
    typeof obj.fats === "number" &&
    typeof obj.protein_goal_met === "boolean" &&
    typeof obj.summary === "string"
  );
}

export async function callAI(prompt: string): Promise<ApiResult> {
  const API_KEY = import.meta.env.VITE_GROQ_KEY;

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a strict nutrition calculator. Always return ONLY valid JSON. No explanation. No markdown. No backticks.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    const data = await res.json();

    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) return DEFAULT_RESULT;

    // 🔥 Step 1: Extract JSON safely
    const jsonString = extractJSON(rawText);

    if (!jsonString) return DEFAULT_RESULT;

    // 🔥 Step 2: Parse
    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      return DEFAULT_RESULT;
    }

    // 🔥 Step 3: Validate structure
    if (!isValidResult(parsed)) return DEFAULT_RESULT;

    return parsed;
  } catch (err) {
    console.error("AI call failed:", err);
    return DEFAULT_RESULT;
  }
}