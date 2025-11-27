import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import VariantPage from './pages/Variant'
import TodayWorkout from './pages/TodayWorkout'
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/variant" element={<VariantPage />} />
        <Route path="/today" element={<TodayWorkout />} />
      </Routes>
    </Layout>
  )
}
