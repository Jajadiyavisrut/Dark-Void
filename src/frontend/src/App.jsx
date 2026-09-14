import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar      from './components/Navbar'
import TopHeader   from './components/TopHeader'
import Dashboard   from './pages/Dashboard'
import Disruptions from './pages/Disruptions'
import Fleet       from './pages/Fleet'
import ColdChain   from './pages/ColdChain'
import Login       from './pages/Login'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function AppLayout({ children }) {
  return (
    <div className="layout">
      <Navbar />
      <div className="content-viewport">
        <TopHeader />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/disruptions" element={
          <ProtectedRoute>
            <AppLayout><Disruptions /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/fleet" element={
          <ProtectedRoute>
            <AppLayout><Fleet /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/cold-chain" element={
          <ProtectedRoute>
            <AppLayout><ColdChain /></AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
