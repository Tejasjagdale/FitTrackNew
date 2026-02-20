// src/data/githubService.ts
import { Octokit } from "octokit";

/* =========================================================
   USER SYSTEM (SESSION ONLY — NO LOCAL STORAGE)
========================================================= */

export type AppUser = "TJ" | "KU";

/* session memory only */
let currentUser: AppUser | null = null;

export function setAppUser(user: AppUser) {
  currentUser = user;
}

export function getAppUser(): AppUser | null {
  return currentUser;
}

/* Resolve file based on selected user */
function resolveFile(base: string) {
  if (currentUser === "KU") {
    const parts = base.split(".");
    return `${parts[0]}K.${parts[1]}`;
  }
  return base;
}

/* ========================================================= */

const OWNER = "Tejasjagdale";
const REPO = "github-db";

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

  /* =========================================================
     FETCH ANY JSON (UNCHANGED)
  ========================================================= */

  async function fetchJSON(path: string) {
    try {
      const res = await _octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path,
      });

      if (Array.isArray(res.data)) {
        throw new Error(`Expected a file but found a directory at ${path}`);
      }

      const file = res.data as any;

      if (file.content && file.encoding === "base64") {
        const decoded = decodeURIComponent(escape(atob(file.content)));
        return JSON.parse(decoded);
      }

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

  /* =========================================================
     UPDATE JSON (UNCHANGED)
  ========================================================= */

  async function updateJSON(path: string, data: any, commitMessage: string) {
    try {
      const content = btoa(
        unescape(encodeURIComponent(JSON.stringify(data, null, 2))),
      );

      let sha: string | undefined = undefined;

      try {
        const res = await _octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path,
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
        sha,
      });
    } catch (err: any) {
      console.error("GitHub update failed:", err);
      throw new Error(err?.message || "Unknown GitHub update error");
    }
  }

  /* =========================================================
     PUBLIC API
  ========================================================= */

  return {
    fetchWorkoutData: () => fetchJSON(resolveFile("workoutData.json")),

    updateWorkoutData: (data: any, msg: string) =>
      updateJSON(resolveFile("workoutData.json"), data, msg),

    fetchProgressData: () => fetchJSON(resolveFile("progressData.json")),

    updateProgressData: (data: any, msg: string) =>
      updateJSON(resolveFile("progressData.json"), data, msg),

    fetchExerciseDatabase: () => fetchJSON(EXERCISE_DB_FILE),

    updateExerciseDatabase: (data: any, msg: string) =>
      updateJSON(EXERCISE_DB_FILE, data, msg),

    fetchTodoData: () => fetchJSON(resolveFile("todo.json")),

    updateTodoData: (data: any, msg: string) =>
      updateJSON(resolveFile("todo.json"), data, msg),
  };
}