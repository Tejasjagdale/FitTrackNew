// src/data/progressDataService.ts
import { getGitHubService } from './githubService'

/**
 * This service manages progressData.json stored in the GitHub repo root.
 * No localStorage. No static fallback. GitHub is always the source of truth.
 *
 * JSON structure expected:
 *
 * {
 *   "profile": {
 *     "name": "Tejas",
 *     "age": 25,
 *     "gender": "male",
 *     "heightCm": 176
 *   },
 *   "goals": {
 *     "targetBMI": 22
 *   },
 *   "dailyWeight": {},
 *   "measurements": {}
 * }
 */

let inMemoryProgress: any = null

/**
 * Load progressData.json from GitHub.
 * Throws if GitHub is not configured or file can't be fetched.
 */
export async function loadProgressData(): Promise<any> {
  const github = getGitHubService()
  if (!github) {
    throw new Error('GitHub not configured. Cannot load progress data.')
  }

  try {
    const remote = await github.fetchProgressData()
    inMemoryProgress = remote
    return inMemoryProgress
  } catch (err) {
    console.error('❌ Failed to load progressData.json from GitHub:')
    console.error(err)
    throw new Error('Failed to load progress data from GitHub.')
  }
}

/**
 * Return the live in-memory version of progressData.json.
 * loadProgressData() must have been called before.
 */
export function getProgressData(): any {
  if (!inMemoryProgress) {
    throw new Error(
      'Progress data requested before loadProgressData() completed.'
    )
  }
  return inMemoryProgress
}

/**
 * Modify the in-memory JSON.
 * (NOT automatically saved to GitHub until user presses Sync)
 */
export function setProgressData(newData: any) {
  inMemoryProgress = newData
}

/**
 * Push the in-memory progressData.json back to GitHub.
 */
export async function syncProgressToGitHub(
  commitMessage = 'Update progress data'
) {
  const github = getGitHubService()
  if (!github) throw new Error('GitHub not configured.')
  if (!inMemoryProgress) throw new Error('No progress data loaded.')

  await github.updateProgressData(inMemoryProgress, commitMessage)
}

/**
 * Always true because we always load from GitHub.
 */
export const isProgressLoadedFromGitHub = (): boolean => true

export default {
  loadProgressData,
  getProgressData,
  setProgressData,
  syncProgressToGitHub,
  isProgressLoadedFromGitHub
}
