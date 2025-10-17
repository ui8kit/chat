import { createRoot } from 'react-dom/client'
import { StrictMode, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, skyOSTheme } from '@ui8kit/core'
import App from '@/App'
import NotFound from '@/exceptions/NotFound'
import ErrorBoundary from '@/exceptions/ErrorBoundary'
// routes
import { Chat } from '@/Chat'
// styles
import './assets/css/index.css'

const ACCESS_CODE = (import.meta.env.VITE_PUBLIC_ACCESS_CODE as string | undefined)?.trim() ?? ''

function AccessGate({ children }: { children: React.ReactNode }) {
  const accessCode = ACCESS_CODE
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('access_code_value')
      return accessCode ? saved === accessCode : true
    } catch {
      return !accessCode
    }
  })

  useEffect(() => {
    if (!accessCode) setAuthorized(true)
  }, [accessCode])

  if (authorized) return children as any

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = input.trim()
    if (value && value === accessCode) {
      try { localStorage.setItem('access_code_value', accessCode) } catch {}
      setAuthorized(true)
      setError(null)
    } else {
      setError('Invalid access code')
    }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-foreground)'
    }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 360, padding: 0 }}>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Enter access code"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 10,
            border: '1px solid var(--color-border)', background: 'var(--color-input)', color: 'inherit',
            boxShadow: 'var(--shadow-sm)', outline: 'none'
          }}
          autoFocus
          aria-label="Access code"
        />
        {error ? (
          <div style={{ color: 'crimson', marginTop: 10, fontSize: 13, textAlign: 'center' }}>{error}</div>
        ) : null}
      </form>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Chat /> },
      { path: '*', element: <NotFound /> }
    ]
  }
])

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={skyOSTheme}>
      <AccessGate>
        <RouterProvider router={router} />
      </AccessGate>
    </ThemeProvider>
  </StrictMode>
)
