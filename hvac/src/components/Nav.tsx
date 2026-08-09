import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Lock, LogOut, KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Modal from './ui/Modal'
import Button from './ui/Button'

export default function Nav() {
  const { isAuthed, login, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  function handleLogin() {
    if (login(passcode)) {
      setShowLogin(false)
      setPasscode('')
      setError(false)
      navigate('/estimate')
    } else {
      setError(true)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--color-paper)]/95 backdrop-blur border-b-2 border-[var(--color-ink)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-[var(--color-ink)] flex items-center justify-center flex-shrink-0">
              <Flame size={18} className="text-[var(--color-accent)]" />
            </div>
            <div className="leading-none">
              <div className="font-display text-xl font-bold">SUMMIT AIR</div>
              <div className="text-[9px] uppercase tracking-widest text-[var(--color-ink)]/50">
                Estimate Builder
              </div>
            </div>
          </Link>

          {isAuthed ? (
            <div className="flex items-center gap-2">
              <Link to="/estimate">
                <Button variant="secondary" size="sm">
                  Estimate Builder
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2.5 rounded-sm text-[var(--color-ink)]/50 hover:text-[var(--color-ink)] hover:bg-black/5"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Button variant="primary" size="sm" icon={<Lock size={15} />} onClick={() => setShowLogin(true)}>
              Tech Login
            </Button>
          )}
        </div>
      </header>

      {showLogin && (
        <Modal title="Technician Login" onClose={() => setShowLogin(false)}>
          <p className="text-sm text-[var(--color-ink)]/60 mb-4">
            Enter the shop passcode to access the estimate builder.
          </p>
          <div className="relative mb-1">
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40" />
            <input
              autoFocus
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value)
                setError(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Passcode: hvac"
              className={`w-full rounded-sm border-2 pl-10 pr-3.5 py-2.5 text-[15px] outline-none ${
                error ? 'border-[var(--color-bad)]' : 'border-[var(--color-line)] focus:border-[var(--color-ink)]'
              }`}
            />
          </div>
          {error && (
            <p className="text-xs font-semibold text-[var(--color-bad)] mb-3">Incorrect passcode. Try again.</p>
          )}
          <Button fullWidth className="mt-3" onClick={handleLogin} disabled={!passcode}>
            Log In
          </Button>
        </Modal>
      )}
    </>
  )
}
