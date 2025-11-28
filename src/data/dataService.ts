// src/data/dataService.ts
import { getGitHubService } from './githubService'

let inMemoryData: any = null

/**
 * Always load the workout JSON from the GitHub repo.
 * No local storage, no static fallback.
 */
export async function loadData(): Promise<any> {
  const github = getGitHubService()
  if (!github) {
    throw new Error('GitHub is not configured. Cannot load data.')
  }

  try {
    const remote = await github.fetchWorkoutData()
    inMemoryData = remote
    return inMemoryData
  } catch (err) {
    console.error('Failed to load remote GitHub data:')
    console.error(err)
    throw new Error('Failed to load workout data from GitHub.')
  }
}

/** Always return the in-memory GitHub data */
export function getData(): any {
  if (!inMemoryData) {
    throw new Error('Data requested before loadData() finished.')
  }
  return inMemoryData
}

/** Update in-memory data (NOT persisted) */
export function setData(newData: any) {
  inMemoryData = newData
}

/** Push the in-memory JSON back to GitHub */
export async function syncToGitHub(commitMessage = 'Update workout data') {
  const github = getGitHubService()
  if (!github) throw new Error('GitHub not configured')
  if (!inMemoryData) throw new Error('No data loaded to sync')

  await github.updateWorkoutData(inMemoryData, commitMessage)
}

/** Since we always load from GitHub, this is always true */
export const isDataLoadedFromGitHub = (): boolean => true

export default {
  loadData,
  getData,
  setData,
  syncToGitHub,
  isDataLoadedFromGitHub
}
