// src/data/exerciseDatabaseService.ts
import { getGitHubService } from "./githubService";

let inMemoryExerciseDB: any = null;

/**
 * Load exerciseDatabase.json from GitHub.
 * Always loads from remote and stores in RAM.
 */
export async function loadExerciseDatabase(): Promise<any> {
  const github = getGitHubService();
  if (!github) {
    throw new Error("GitHub not configured. Cannot load exercise database.");
  }

  try {
    const remote = await github.fetchExerciseDatabase();
    inMemoryExerciseDB = remote;
    return inMemoryExerciseDB;
  } catch (err) {
    console.error("❌ Failed to load exerciseDatabase.json from GitHub:", err);
    throw new Error("Failed to load exercise database from GitHub.");
  }
}

/**
 * Return the live in-memory version.
 * Throws if loadExerciseDatabase() wasn't called first.
 */
export function getExerciseDatabase(): any {
  if (!inMemoryExerciseDB) {
    throw new Error(
      "Exercise database requested before loadExerciseDatabase() completed."
    );
  }
  return inMemoryExerciseDB;
}

/**
 * Modify RAM version (not written to GitHub until sync).
 */
export function setExerciseDatabase(newData: any) {
  inMemoryExerciseDB = newData;
}

/**
 * Push exerciseDatabase.json back to GitHub.
 */
export async function syncExerciseDatabase(
  commitMessage = "Update exercise database"
) {
  const github = getGitHubService();
  if (!github) throw new Error("GitHub not configured.");
  if (!inMemoryExerciseDB) throw new Error("No exercise database loaded.");

  await github.updateExerciseDatabase(inMemoryExerciseDB, commitMessage);
}

export const isExerciseDBLoadedFromGitHub = (): boolean => true;

export default {
  loadExerciseDatabase,
  getExerciseDatabase,
  setExerciseDatabase,
  syncExerciseDatabase,
  isExerciseDBLoadedFromGitHub,
};
