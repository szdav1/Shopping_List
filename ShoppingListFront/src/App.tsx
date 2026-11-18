import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import ShoppingBasketOutlined from '@mui/icons-material/ShoppingBasketOutlined'
import {
  ApiError,
  clearSession,
  getCurrentUser,
  loadSession,
  login,
  logout,
  saveSession,
  type AuthSession,
} from './auth'
import { AuthStoryPanel } from './components/AuthStoryPanel'
import { LoginForm } from './components/LoginForm'
import './App.css'

type Screen = 'checking' | 'login' | 'authenticated'

const invalidCredentialsMessage = 'Érvénytelen felhasználónév vagy jelszó!'
const Workspace = lazy(() => import('./Workspace'))

function App() {
  const [screen, setScreen] = useState<Screen>('checking')
  const [session, setSession] = useState<AuthSession | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const savedSession = loadSession()
    if (!savedSession) {
      setScreen('login')
      return
    }

    const controller = new AbortController()
    void getCurrentUser(savedSession.accessToken, controller.signal)
      .then((currentUser) => {
        const restoredSession = { ...savedSession, user: currentUser }
        saveSession(restoredSession)
        setSession(restoredSession)
        setScreen('authenticated')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        if (error instanceof ApiError && error.status === 401) {
          clearSession()
          setSession(null)
        } else {
          setMessage('Nem sikerült ellenőrizni a munkamenetet. Ellenőrizd a kapcsolatot, majd jelentkezz be újra.')
        }
        setScreen('login')
      })

    return () => controller.abort()
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setIsSubmitting(true)

    try {
      const session = await login(username.trim(), password)
      saveSession(session)
      setSession(session)
      setScreen('authenticated')
      setPassword('')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setMessage(invalidCredentialsMessage)
      } else {
        setMessage(error instanceof Error ? error.message : 'A bejelentkezés nem sikerült.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = useCallback(async () => {
    const savedSession = session ?? loadSession()
    if (!savedSession) {
      setSession(null)
      setScreen('login')
      return
    }

    setMessage('')
    setIsSubmitting(true)
    try {
      await logout(savedSession.accessToken, savedSession.tokenType)
      clearSession()
      setSession(null)
      setUsername('')
      setScreen('login')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'A kijelentkezés nem sikerült.')
    } finally {
      setIsSubmitting(false)
    }
  }, [session])

  const handleSessionExpired = useCallback(() => {
    clearSession()
    setSession(null)
    setScreen('login')
    setMessage('A munkamenet lejárt. Jelentkezz be újra.')
  }, [])

  if (screen === 'authenticated' && session) {
    return (
      <Suspense fallback={<Box className="checking-state" role="status"><CircularProgress size={28} /></Box>}>
        <Workspace
          session={session}
          logoutError={message}
          onLogout={handleLogout}
          onSessionExpired={handleSessionExpired}
        />
      </Suspense>
    )
  }

  return (
    <Box component="main" className="auth-page">
      <AuthStoryPanel />

      <Box component="section" className="form-panel">
        <Box className="form-inner">
          <Box className="mobile-brand brand-lockup">
            <ShoppingBasketOutlined aria-hidden="true" />
            <span>kosár</span>
          </Box>

          {screen === 'checking' ? (
            <Box className="checking-state" role="status">
              <CircularProgress size={28} />
              <Typography>Munkamenet ellenőrzése...</Typography>
            </Box>
          ) : (
            <LoginForm
              username={username}
              password={password}
              showPassword={showPassword}
              isSubmitting={isSubmitting}
              message={message}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onShowPasswordChange={() => setShowPassword((visible) => !visible)}
              onSubmit={handleLogin}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default App
