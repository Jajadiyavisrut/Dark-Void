import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, Lock, User, CheckCircle2, ArrowRight } from 'lucide-react'
import axios from 'axios'

export default function Login() {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo123')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', { username, password })
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 420,
        padding: '36px 32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.15)'
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--cyan), var(--indigo))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(56,189,248,0.35)'
          }}>
            <Layers size={22} color="#08090C" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)' }}>
                SupplyFlow
              </span>
              <span style={{
                padding: '2px 6px',
                borderRadius: 9999,
                background: 'rgba(56,189,248,0.2)',
                color: 'var(--cyan)',
                border: '1px solid rgba(56,189,248,0.3)',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700
              }}>
                AI
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-3)' }}>
              Mission-critical autonomous supply chain intelligence
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: 'var(--r-md)',
            padding: '10px 14px',
            color: 'var(--red-txt)',
            fontSize: 12,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red-txt)' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 6
            }}>
              Operator Identity
            </label>
            <div className="search-wrap" style={{ width: '100%' }}>
              <User size={15} style={{ left: 12 }} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="Operator ID or handle"
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              marginBottom: 6
            }}>
              Access Key
            </label>
            <div className="search-wrap" style={{ width: '100%' }}>
              <Lock size={15} style={{ left: 12 }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '11px',
              justifyContent: 'center',
              marginTop: 6,
              fontSize: 14
            }}
          >
            <span>{loading ? 'Authenticating…' : 'Access Orchestration Grid'}</span>
            <ArrowRight size={16} />
          </button>

          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(255,255,255,0.02)',
            border: 'var(--border-subtle)',
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Preset Credentials:</span>
            <span style={{ color: 'var(--cyan)' }}>demo / demo123</span>
          </div>
        </form>
      </div>
    </div>
  )
}
