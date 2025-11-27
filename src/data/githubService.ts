import { Octokit } from "octokit"

const OWNER = "Tejasjagdale"
const REPO = "github-db"
const FILE_PATH = "workoutData.json"

// Initialize once
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

  const _octokit = octokit // capture in closure

  return {
    fetchWorkoutData: async () => {
      try {
        const res = await _octokit.rest.repos.getContent({
          owner: OWNER,
          repo: REPO,
          path: FILE_PATH
        })

        if (Array.isArray(res.data)) {
          throw new Error('Expected file content but got directory')
        }

        const raw = (res.data as any).content || ''
        // decode base64 -> UTF8
        const decoded = decodeURIComponent(escape(atob(raw)))
        return JSON.parse(decoded)
      } catch (err) {
        throw err
      }
    },

    updateWorkoutData: async (data: any, commitMessage: string) => {
      try {
        // Convert JSON → Base64
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))))

        // STEP 1: Fetch existing file SHA (required for update)
        let sha: string | undefined = undefined
        try {
          const res = await _octokit.rest.repos.getContent({
            owner: OWNER,
            repo: REPO,
            path: FILE_PATH
          })

          if (!Array.isArray(res.data)) {
            sha = res.data.sha
          }
        } catch (err) {
          // If file is missing on repo, SHA stays undefined → GitHub will CREATE file instead of update
          console.warn("File not found on GitHub, creating new file...")
        }

        // STEP 2: Create or update file
        await _octokit.rest.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path: FILE_PATH,
          message: commitMessage,
          content,
          sha // undefined = create, defined = update
        })

      } catch (err: any) {
        throw new Error(err?.message || "Unknown GitHub update error")
      }
    }
  }
}
