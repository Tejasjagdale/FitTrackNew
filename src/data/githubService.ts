// src/data/githubService.ts
import { Octokit } from "octokit";

const OWNER = "Tejasjagdale";
const REPO = "github-db";

const WORKOUT_FILE = "workoutData.json";
const PROGRESS_FILE = "progressData.json";
const EXERCISE_DB_FILE = "exerciseDatabase.json";

let octokit: Octokit | null = null;

export function isGitHubConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GITHUB_TOKEN);
}

export function getGitHubService() {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) return null;

  if (!octokit) {
    octokit = new Octokit({ auth: token });
  }

  const _octokit = octokit;

  /**
   * Fetch ANY JSON file, including large (>1MB).
   */
  async function fetchJSON(path: string) {
    try {
      // 1) Get metadata
      const res = await _octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path
      });

      // A: If GitHub returns a directory → error
      if (Array.isArray(res.data)) {
        throw new Error(`Expected a file but found a directory at ${path}`);
      }

      const file = res.data as any;

      // B: If content field is present (small file)
      if (file.content && file.encoding === "base64") {
        const decoded = decodeURIComponent(escape(atob(file.content)));
        return JSON.parse(decoded);
      }

      // C: If encoding = none → file is too large, fetch using git_url
      if (file.encoding === "none" && file.sha && file.git_url) {
        const blob = await _octokit.request(`GET ${file.git_url}`);
        const base64 = blob.data.content;
        const text = decodeURIComponent(escape(atob(base64)));
        return JSON.parse(text);
      }

      throw new Error("Unsupported GitHub file encoding or missing content.");
    } catch (err) {
      console.error("GitHub fetch failed:", err);
      throw err;
    }
  }

  /**
   * Update any JSON file (small or large).
   */
  async function updateJSON(path: string, data: any, commitMessage: string) {
    try {
      const content = btoa(
        unescape(encodeURIComponent(JSON.stringify(data, null, 2)))
      );

      let sha: string | undefined = undefined;
      try {
        const res = await _octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path
        });
        if (!Array.isArray(res.data)) sha = res.data.sha;
      } catch {
        console.warn(`File '${path}' does not exist. Creating new file.`);
      }

      await _octokit.rest.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path,
        message: commitMessage,
        content,
        sha
      });
    } catch (err: any) {
      console.error("GitHub update failed:", err);
      throw new Error(err?.message || "Unknown GitHub update error");
    }
  }

  return {
    // Workout
    fetchWorkoutData: () => fetchJSON(WORKOUT_FILE),
    updateWorkoutData: (data: any, msg: string) =>
      updateJSON(WORKOUT_FILE, data, msg),

    // Progress
    fetchProgressData: () => fetchJSON(PROGRESS_FILE),
    updateProgressData: (data: any, msg: string) =>
      updateJSON(PROGRESS_FILE, data, msg),

    // Exercise DB (NEW)
    fetchExerciseDatabase: () => fetchJSON(EXERCISE_DB_FILE),
    updateExerciseDatabase: (data: any, msg: string) =>
      updateJSON(EXERCISE_DB_FILE, data, msg)
  };
}
