# Todo App - Sub-app Architecture

## Overview

The Todo App is now organized as a proper sub-app within FitTrack, providing task management with groups, deadlines, and repeating tasks. The app is seamlessly integrated into the main Home page while maintaining its full feature set at `/todo`.

## Structure

### Home Page Integration

The **Home Page** (`src/pages/Home.tsx`) now displays:

1. **Today's Priority** (`src/components/homeComponents/TodaysPriority.tsx`)
   - High-priority tasks (priority >= 4)
   - Tasks due today
   - Daily repeating tasks
   - Shows streaks for repeating tasks
   - Limited to top 6 tasks for focus

2. **Pending Tasks Summary** (`src/components/homeComponents/PendingTasksSummary.tsx`)
   - Overdue tasks (⚠️)
   - Tasks due today (📅)
   - Upcoming tasks this week (upcoming)
   - Repeating tasks with status
   - Completion rate progress bar

### Todo App Structure

#### Pages
- **TodoApp.tsx** - Full task management page with:
  - Multiple tabs (tasks, groups, streaks)
  - Task list with filters
  - Group management
  - Streak tracking

#### Components
- **TodoComponents/**
  - `TaskCard.tsx` - Individual task display with visual priority indicators
  - `TaskList.tsx` - List of tasks with filters
  - `TaskModal.tsx` - Create/edit task dialog
  - `GroupList.tsx` - Manage task groups
  - `GroupModal.tsx` - Create/edit group dialog
  - `TabsHeader.tsx` - Navigation between views
  - `HomeDashboard.tsx` - Dashboard component
  - `StreakList.tsx` - View streaks
  - `ConfirmDialog.tsx` - Confirmation dialogs

#### Data Management
- **todoDataService.ts** - Data loading/syncing with GitHub
- **TodoDatabase** - In-memory storage with persistence
  - `tasks[]` - Array of all tasks
  - `groups[]` - Array of task groups

#### Engines
- **taskEngine.ts** - Core task operations:
  - `toggleCompleteTask()` - Complete/uncomplete tasks
  - `resetRepeatTasks()` - Reset daily/repeating tasks
  - `completeTask()` - Mark task complete with streak updates

- **taskPriorityEngine.ts** - Priority and scheduling:
  - `getDaysDiff()` - Calculate days until deadline
  - `getRepeatDiff()` - Calculate days until next repeat
  - Sorting by priority level

- **timeEngine.ts** - Time calculations

#### Types
- **todoModels.ts** - TypeScript interfaces:
  ```typescript
  interface Task {
    id: string
    title: string
    priority: 1-5 (Low to Critical)
    groupIds: string[]
    type: "repeat" | "deadline"
    deadline: ISO date or null
    repeatEveryDays: number or null
    trackStreak: boolean
    streak: { current: number; longest: number } or null
    lastCompleted: ISO date or null
    status: "pending" | "completed" | "on_hold"
  }

  interface Group {
    id: string
    name: string
  }
  ```

## Features

### Task Types

1. **Deadline Tasks**
   - Have a specific deadline date
   - Can be overdue, due today, or upcoming
   - Show days remaining
   - Cannot repeat

2. **Repeating Tasks**
   - Set to repeat every N days
   - Track streak if enabled
   - Automatically reset when eligible
   - Great for habits and daily tasks

### Priority Levels

- **Level 5**: 🔴 Critical (Red) - Most urgent
- **Level 4**: 🟠 High (Orange) - Important
- **Level 3**: 🔵 Focused (Blue) - Normal focus
- **Level 2**: 🟢 Normal (Green) - Regular
- **Level 1**: ⚪ Low (Gray) - Low priority

### Task Status

- **Pending** - Active task
- **Completed** - Marked done (keeps streak)
- **On Hold** - Paused

### Grouping

Tasks can belong to multiple groups for categorization:
- Work
- Personal
- Health
- Fitness
- etc.

## Usage

### From Home Page

1. **View Today's Priorities**
   - See top 6 priority tasks
   - Click any task to go to full planner

2. **View All Pending Tasks**
   - See overdue, today, this week, and repeating tasks
   - Progress bar showing completion rate
   - Quick navigation to full planner

### From Todo App Page

1. **Create Task**
   - Click FAB (+ button)
   - Choose type (deadline or repeat)
   - Set priority, due date, group

2. **Create Group**
   - Click category icon
   - Add new group for organization

3. **Complete Task**
   - Click checkbox on task
   - Updates streak if enabled
   - Repeating tasks auto-reset

4. **View Streaks**
   - Switch to "Streaks" tab
   - See current and longest streaks
   - Motivates consistency

## Integration with FitTrack

The Todo App is fully integrated with FitTrack's:
- **GitHub sync** - All data persisted to GitHub
- **Theme system** - Respects app theme (dark/light)
- **Navigation** - Seamlessly navigates with other modules
- **Home dashboard** - Shows pending tasks on arrival

## Data Persistence

All todo data is:
- Stored in memory during session
- Synced to GitHub repository
- Persists across app refreshes
- Can be manually synced via button

## File Organization

```
src/
├── pages/
│   ├── Home.tsx (UPDATED - Shows todo preview)
│   └── TodoApp.tsx (Full todo app)
├── components/
│   ├── homeComponents/ (NEW)
│   │   ├── PendingTasksSummary.tsx
│   │   └── TodaysPriority.tsx
│   └── todoComponents/
│       ├── TaskCard.tsx
│       ├── TaskList.tsx
│       ├── TaskModal.tsx
│       ├── GroupList.tsx
│       ├── GroupModal.tsx
│       ├── TabsHeader.tsx
│       ├── HomeDashboard.tsx
│       ├── StreakList.tsx
│       └── ConfirmDialog.tsx
├── data/
│   └── todoDataService.ts
├── engine/
│   ├── taskEngine.ts
│   ├── taskPriorityEngine.ts
│   └── timeEngine.ts
├── types/
│   └── todoModels.ts
└── utils/
    └── dateUtils.ts
```

## Future Enhancements

- Recurring task templates
- Task notes and attachments
- Estimated time tracking
- Calendar view
- Task dependencies
- Notifications for overdue tasks
- Export/import functionality
