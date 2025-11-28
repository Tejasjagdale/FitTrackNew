// src/data/githubService.ts
import { Octokit } from "octokit"

const OWNER = "Tejasjagdale"
const REPO = "github-db"

// File paths in repo root
const WORKOUT_FILE = "workoutData.json"
const PROGRESS_FILE = "progressData.json"

let octokit: Octokit | null = null

export function isGitHubConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GITHUB_TOKEN)
}

export function getGitHubService() {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  if (!token) return null

  if (!octokit) {
    octokit = new Octokit({ auth: token })
  }

  const _octokit = octokit

  // Helper: read any JSON file from GitHub
  async function fetchJSON(path: string) {
    try {
      const res = await _octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path
      })

      if (Array.isArray(res.data)) {
        throw new Error(`Expected file but got directory for path: ${path}`)
      }

      const raw = (res.data as any).content || ""
      const decoded = decodeURIComponent(escape(atob(raw)))
      return JSON.parse(decoded)
    } catch (err) {
      console.error("GitHub fetch failed:", err)
      throw err
    }
  }

  // Helper: update any JSON file in GitHub
  async function updateJSON(path: string, data: any, commitMessage: string) {
    try {
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))

      // STEP 1: get SHA (needed for update)
      let sha: string | undefined = undefined
      try {
        const res = await _octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path
        })

        if (!Array.isArray(res.data)) {
          sha = res.data.sha
        }
      } catch {
        console.warn(`File '${path}' not found — will create new one.`)
      }

      // STEP 2: update or create
      await _octokit.rest.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path,
        message: commitMessage,
        content,
        sha
      })
    } catch (err: any) {
      console.error("GitHub update failed:", err)
      throw new Error(err?.message || "Unknown GitHub update error")
    }
  }

  return {
    // -------- WORKOUT DATA --------
    fetchWorkoutData: async () => fetchJSON(WORKOUT_FILE),
    updateWorkoutData: async (data: any, message: string) =>
      updateJSON(WORKOUT_FILE, data, message),

    // -------- PROGRESS DATA --------
    fetchProgressData: async () => fetchJSON(PROGRESS_FILE),
    updateProgressData: async (data: any, message: string) =>
      updateJSON(PROGRESS_FILE, data, message)
  }
}
