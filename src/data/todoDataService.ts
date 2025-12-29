// src/data/todoDataService.ts
import { getGitHubService } from './githubService'

let inMemoryTodo: any = null

export async function loadTodoData() {
  const github = getGitHubService()
  if (!github) {
    throw new Error('GitHub not configured')
  }

  const data = await github.fetchTodoData()
  inMemoryTodo = data
  return data
}

export function getTodoData() {
  if (!inMemoryTodo) {
    throw new Error('Todo data accessed before load')
  }
  return inMemoryTodo
}

export function setTodoData(data: any) {
  inMemoryTodo = data
}

export async function syncTodoToGitHub(
  commitMessage = 'Update todo data'
) {
  const github = getGitHubService()
  if (!github) throw new Error('GitHub not configured')
  if (!inMemoryTodo) throw new Error('No todo data loaded')

  await github.updateTodoData(inMemoryTodo, commitMessage)
}
