import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VariantPage from './pages/Variant'
import WorkoutPlaylist from './pages/WorkoutPlaylist'
import Layout from './components/Layout'
import ProgressPage from './pages/ProgressPage'
import TodayWorkout from './pages/TodayWorkout'
import ExerciseDatabasePage from './pages/ExerciseDatabasePage'
import TodoApp from './pages/TodoApp'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/variant" element={<VariantPage />} />
        <Route path="/today" element={<TodayWorkout />} />
        <Route path="/workout-playlist" element={<WorkoutPlaylist />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/exercise-database" element={<ExerciseDatabasePage />} />
        <Route path="/todo" element={<TodoApp />} />
      </Routes>
    </Layout>
  )
}
