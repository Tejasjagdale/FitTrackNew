import { TodoDatabase } from "../types/todoModels";
import { getGitHubService } from "./githubService";

let inMemoryTodo: TodoDatabase | null = null;

export async function loadTodoData(): Promise<TodoDatabase> {
  const github = getGitHubService();

  if (!github) {
    throw new Error("GitHub not configured");
  }

  const data = await github.fetchTodoData();

  inMemoryTodo = data as TodoDatabase;

  return inMemoryTodo;
}

export function getTodoData(): TodoDatabase {
  if (!inMemoryTodo) {
    throw new Error("Todo data accessed before load");
  }

  return inMemoryTodo;
}

export function setTodoData(data: TodoDatabase) {
  inMemoryTodo = data;
}

export async function syncTodoToGitHub(commitMessage = "Update todo data") {
  const github = getGitHubService();

  if (!github) throw new Error("GitHub not configured");
  if (!inMemoryTodo) throw new Error("No todo data loaded");

  await github.updateTodoData(inMemoryTodo, commitMessage);
}
