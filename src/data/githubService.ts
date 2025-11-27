/**
 * GitHub Service for managing workout data
 * Uses GitHub API to fetch and update workoutData.json from the github-db repository
 */

const GITHUB_OWNER = 'Tejasjagdale'
const GITHUB_REPO = 'github-db'
const GITHUB_FILE_PATH = 'workoutData.json'
const GITHUB_API_BASE = 'https://api.github.com'

export interface WorkoutData {
  weeklyOrder: string[]
  variants: Array<{
    variantName: string
    exercisesList: Array<{
      name: string
      sets: number
      reps: string
    }>
    exerciseOrder: Array<{
      step: number
      name: string
      set: number
      reps: string
      restSeconds: number
      equipment: string
    }>
  }>
}

interface GitHubFileResponse {
  name: string
  path: string
  sha: string
  size: number
  type: string
  content: string
  encoding: string
  url: string
  html_url: string
  git_url: string
  download_url: string
  _links: {
    self: string
    git: string
    html: string
  }
}

export class GitHubService {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  /**
   * Fetch the current workoutData.json from GitHub
   */
  async fetchWorkoutData(): Promise<WorkoutData> {
    try {
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }

      const data: GitHubFileResponse = await response.json()

      // Decode the base64 content
      const decodedContent = atob(data.content)
      const workoutData: WorkoutData = JSON.parse(decodedContent)

      // Store the SHA for later use in updates
      localStorage.setItem('gitHubFileSha', data.sha)

      return workoutData
    } catch (error) {
      console.error('Error fetching workout data from GitHub:', error)
      throw error
    }
  }

  /**
   * Update the workoutData.json file on GitHub
   */
  async updateWorkoutData(data: WorkoutData, message: string = 'Update workout data'): Promise<void> {
    try {
      const url = `${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`

      // Get the current SHA (needed for updates)
      let sha = localStorage.getItem('gitHubFileSha')

      if (!sha) {
        // If we don't have the SHA, fetch it first
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        })

        if (response.ok) {
          const fileData: GitHubFileResponse = await response.json()
          sha = fileData.sha
          localStorage.setItem('gitHubFileSha', sha)
        }
      }

      if (!sha) {
        throw new Error('Could not get file SHA for update')
      }

      // Encode the content as base64
      const content = JSON.stringify(data, null, 2)
      const encodedContent = btoa(content)

      const updateResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          content: encodedContent,
          sha
        })
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json()
        console.error('GitHub update error:', errorData)
        throw new Error(`Failed to update file: ${updateResponse.statusText}`)
      }

      // Update the stored SHA
      const responseData = await updateResponse.json()
      if (responseData.commit && responseData.commit.sha) {
        localStorage.setItem('gitHubFileSha', responseData.content.sha)
      }

      console.log('Workout data updated on GitHub successfully')
    } catch (error) {
      console.error('Error updating workout data on GitHub:', error)
      throw error
    }
  }

  /**
   * Validate the token by attempting to fetch user information
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Error validating GitHub token:', error)
      return false
    }
  }
}

export const getGitHubService = (): GitHubService | null => {
  const token = localStorage.getItem('gitHubToken')
  if (!token) return null
  return new GitHubService(token)
}

export const setGitHubToken = (token: string): void => {
  localStorage.setItem('gitHubToken', token)
}

export const removeGitHubToken = (): void => {
  localStorage.removeItem('gitHubToken')
  localStorage.removeItem('gitHubFileSha')
}
