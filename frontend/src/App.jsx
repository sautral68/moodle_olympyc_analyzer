import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Subjects from './pages/Subjects'
import TopStudents from './pages/TopStudents'
import Institutions from './pages/Institutions'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="top" element={<TopStudents />} />
        <Route path="institutions" element={<Institutions />} />
      </Route>
    </Routes>
  )
}