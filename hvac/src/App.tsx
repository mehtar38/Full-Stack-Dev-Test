import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { EstimateProvider } from './context/EstimateContext'
import Nav from './components/Nav'
import Home from './pages/Home'
import EstimateBuilder from './pages/EstimateBuilder'

function ProtectedEstimateRoute() {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/" replace />
  return (
    <EstimateProvider>
      <EstimateBuilder />
    </EstimateProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/estimate" element={<ProtectedEstimateRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </HashRouter>
    </AuthProvider>
  )
}
