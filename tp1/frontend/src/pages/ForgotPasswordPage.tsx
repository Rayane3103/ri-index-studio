import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, FlaskConical, KeyRound, Loader2, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { forgotPassword, resetPassword } from '../api'
import { AuthLayout } from '../components/auth/AuthLayout'
import { SuccessCheck } from '../components/storage/SuccessCheck'
import { Button } from '../components/ui/Button'
import { ErrorNotice } from '../components/ui/ErrorNotice'
import { TextField } from '../components/ui/TextField'
import { t } from '../i18n'
import { navigate } from '../lib/router'

type Step = 0 | 1 | 2 | 'done'
const MIN_LENGTH = 8
const a = t.auth

/** email -> code (shown on screen in demo mode) -> new password -> done */
export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(0)
  const [email, setEmail] = useState('')
  const [demoCode, setDemoCode] = useState<{ code: string; minutes: number } | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tried, setTried] = useState(false)

  const fail = (e: unknown) => {
    setError(e instanceof Error ? e.message : String(e))
    setBusy(false)
  }

  const sendCode = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const answer = await forgotPassword(email)
      setDemoCode({ code: answer.demo_code, minutes: Math.round(answer.expires_in / 60) })
      setCode('')
      setStep(1)
      setBusy(false)
    } catch (e) {
      fail(e)
    }
  }

  const tooShort = password.length < MIN_LENGTH
  const mismatch = confirm !== '' && confirm !== password

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setTried(true)
    if (tooShort || confirm !== password) return
    setBusy(true)
    setError(null)
    try {
      await resetPassword(email, code, password)
      setStep('done')
    } catch (e) {
      fail(e)
      // A wrong or expired code: go back to the code step to fix it.
      if (e instanceof Error && /code/i.test(e.message)) setStep(1)
    }
  }

  const backToLogin = (
    <a
      href="/login"
      onClick={(e) => {
        e.preventDefault()
        navigate('/login')
      }}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
    >
      <ArrowLeft size={14} aria-hidden />
      {a.backToLogin}
    </a>
  )

  return (
    <AuthLayout>
      {step !== 'done' && backToLogin}
      <AnimatePresence mode="wait">
        {step === 'done' ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center" role="status">
            <SuccessCheck />
            <h2 className="mt-5 text-[26px] font-semibold tracking-tight">{a.resetDone}</h2>
            <p className="mt-1.5 text-[15px] text-muted">{a.resetDoneBody}</p>
            <Button className="mt-8 w-full !py-3" onClick={() => navigate('/login')}>
              {a.backToLogin}
            </Button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6">
            <h2 className="text-[28px] font-semibold tracking-tight">{a.forgotTitle}</h2>
            <Stepper current={step} />

            <AnimatePresence mode="wait" initial={false}>
              {step === 0 && (
                <motion.form key="email" onSubmit={sendCode} {...slide} className="flex flex-col gap-5" noValidate>
                  <p className="text-[15px] text-muted">{a.forgotEmailBody}</p>
                  <TextField label={a.email} type="email" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
                  {error && <ErrorNotice title={a.resetError} message={error} />}
                  <Button
                    type="submit"
                    disabled={busy || !email.includes('@')}
                    className="w-full !py-3"
                    icon={busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Mail size={17} aria-hidden />}
                  >
                    {busy ? a.sendingCode : a.sendCode}
                  </Button>
                </motion.form>
              )}

              {step === 1 && (
                <motion.form
                  key="code"
                  {...slide}
                  onSubmit={(e) => {
                    e.preventDefault()
                    setError(null)
                    setStep(2)
                  }}
                  className="flex flex-col gap-5"
                  noValidate
                >
                  {demoCode && (
                    <div className="rounded-2xl border border-orange/60 bg-orange-soft p-4" role="status">
                      <p className="flex items-center gap-2 text-sm font-semibold text-orange-strong">
                        <FlaskConical size={15} aria-hidden />
                        {a.demoTitle}
                      </p>
                      <p className="num mt-2 font-mono text-[30px] font-semibold tracking-[0.3em] text-ink">{demoCode.code}</p>
                      <p className="mt-1 text-[13px] text-muted">{a.demoBody(demoCode.minutes)}</p>
                    </div>
                  )}
                  <p className="text-[15px] text-muted">{a.codeBody(email)}</p>
                  <TextField
                    label={a.codeLabel}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="[&_input]:num [&_input]:font-mono [&_input]:text-lg [&_input]:tracking-[0.3em]"
                  />
                  {error && <ErrorNotice title={a.resetError} message={error} />}
                  <Button type="submit" disabled={code.length !== 6} className="w-full !py-3" icon={<KeyRound size={17} aria-hidden />}>
                    {a.next}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setStep(0)
                    }}
                    className="text-[13px] font-medium text-blue-strong hover:underline"
                  >
                    {a.useOtherEmail}
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form key="password" onSubmit={save} {...slide} className="flex flex-col gap-5" noValidate>
                  <TextField
                    label={a.newPassword}
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    hint={a.newPasswordHint}
                    error={tried && tooShort ? a.tooShort : null}
                  />
                  <TextField
                    label={a.confirmPassword}
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    error={mismatch ? a.mismatch : null}
                  />
                  {error && <ErrorNotice title={a.resetError} message={error} />}
                  <Button
                    type="submit"
                    disabled={busy || password === '' || confirm === ''}
                    className="w-full !py-3"
                    icon={busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Check size={17} aria-hidden />}
                  >
                    {busy ? a.saving : a.save}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}

const slide = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.22 },
}

/** The three steps of the reset, with a line that fills as you go. */
function Stepper({ current }: { current: 0 | 1 | 2 }) {
  return (
    <ol className="mb-7 mt-6 grid grid-cols-3 gap-2" aria-label={a.forgotTitle}>
      {a.forgotSteps.map((label, i) => {
        const done = i < current
        const now = i === current
        return (
          <li key={label} aria-current={now ? 'step' : undefined}>
            <div className="h-1 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-blue"
                initial={false}
                animate={{ width: done || now ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className={`mt-2 text-[12.5px] font-medium ${now ? 'text-ink' : done ? 'text-blue-strong' : 'text-muted'}`}>{label}</p>
          </li>
        )
      })}
    </ol>
  )
}
