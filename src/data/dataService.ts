import localData from './workoutData.json'
import { getGitHubService, isGitHubConfigured } from './githubService'

let inMemoryData: any = null

export async function loadData(): Promise<any> {
  // If GitHub is configured, fetch remote file once
  const github = getGitHubService()
  if (github) {
    try {
      const remote = await github.fetchWorkoutData()
      inMemoryData = remote
      return inMemoryData
    } catch (err) {
      console.warn('Failed to load data from GitHub, falling back to local data', err)
    }
  }

  // Fallback to local static data
  inMemoryData = localData
  return inMemoryData
}

export function getData(): any {
  if (inMemoryData) return inMemoryData
  // if not loaded yet, return local static data as fallback
  return localData
}

export function setData(newData: any) {
  inMemoryData = newData
}

export async function syncToGitHub(commitMessage = 'Update workout data') {
  const github = getGitHubService()
  if (!github) throw new Error('GitHub not configured')
  if (!inMemoryData) throw new Error('No in-memory data to sync')

  await github.updateWorkoutData(inMemoryData, commitMessage)
}

export const isDataLoadedFromGitHub = (): boolean => {
  return isGitHubConfigured() && inMemoryData !== null && inMemoryData !== localData
}

export default {
  loadData,
  getData,
  setData,
  syncToGitHub,
  isDataLoadedFromGitHub
}
