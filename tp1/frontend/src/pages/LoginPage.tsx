import { motion } from 'framer-motion'
import { Loader2, LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { AuthLayout } from '../components/auth/AuthLayout'
import { Button } from '../components/ui/Button'
import { ErrorNotice } from '../components/ui/ErrorNotice'
import { TextField } from '../components/ui/TextField'
import { t } from '../i18n'
import { navigate } from '../lib/router'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
        <h2 className="text-[28px] font-semibold tracking-tight">{t.auth.loginTitle}</h2>
        <p className="mt-1.5 text-[15px] text-muted">{t.auth.loginBody}</p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-5" noValidate>
          <TextField label={t.auth.email} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <TextField
              label={t.auth.password}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault()
                navigate('/forgot-password')
              }}
              className="mt-2 inline-block text-[13px] font-medium text-blue-strong hover:underline"
            >
              {t.auth.forgot}
            </a>
          </div>

          {error && <ErrorNotice title={t.auth.loginError} message={error} />}

          <Button
            type="submit"
            disabled={busy || email === '' || password === ''}
            className="mt-1 w-full !py-3 !text-[15px]"
            icon={busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <LogIn size={17} aria-hidden />}
          >
            {busy ? t.auth.submitting : t.auth.submit}
          </Button>
        </form>
      </motion.div>
    </AuthLayout>
  )
}
