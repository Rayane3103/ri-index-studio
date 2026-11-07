import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useAuth } from './auth/AuthContext'
import { homeOf } from './auth/session'
import { navigate, usePath, type Path } from './lib/router'
import { AdminPage } from './pages/AdminPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { UserPage } from './pages/UserPage'

/** Picks the page from the URL, and sends people where they are allowed to be. */
export function App() {
  const { status, user } = useAuth()
  const path = usePath()

  // Where this person should be instead, or null if the current page is fine.
  let redirect: Path | null = null
  const publicPage = path === '/login' || path === '/forgot-password'
  if (status === 'signed-out' && !publicPage) redirect = '/login'
  if (status === 'signed-in' && user) {
    if (publicPage || (path !== '/admin' && path !== '/app')) redirect = homeOf(user)
    else if (path === '/admin' && user.role !== 'admin') redirect = '/app'
  }

  useEffect(() => {
    if (redirect) navigate(redirect, true)
  }, [redirect])

  if (status === 'checking' || redirect) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper" aria-busy>
        <Loader2 size={22} className="animate-spin text-blue" aria-label="Loading" />
      </div>
    )
  }
  if (path === '/forgot-password') return <ForgotPasswordPage />
  if (path === '/admin') return <AdminPage />
  if (path === '/app') return <UserPage />
  return <LoginPage />
}
