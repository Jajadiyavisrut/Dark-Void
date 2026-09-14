import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar      from './components/Navbar'
import Dashboard   from './pages/Dashboard'
import Disruptions from './pages/Disruptions'
import Fleet       from './pages/Fleet'
import ColdChain   from './pages/ColdChain'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"            element={<Dashboard />}   />
            <Route path="/disruptions" element={<Disruptions />} />
            <Route path="/fleet"       element={<Fleet />}       />
            <Route path="/cold-chain"  element={<ColdChain />}   />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
