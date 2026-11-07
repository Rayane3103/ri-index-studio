import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react'
import { t } from '../../i18n'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string | null
}

/** A labelled input. type="password" gets a show/hide button. */
export const TextField = forwardRef<HTMLInputElement, Props>(function TextField({ label, hint, error, type = 'text', className = '', ...rest }, ref) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-paper px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-faint focus:ring-4 ${
            isPassword ? 'pr-11' : ''
          } ${error ? 'border-bad focus:ring-bad/15' : 'border-line hover:border-faint focus:border-blue focus:ring-blue/15'}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
            aria-pressed={visible}
            className="absolute inset-y-0 right-1 my-auto grid h-9 w-9 place-items-center rounded-lg text-muted hover:text-ink"
          >
            {visible ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] text-bad">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
})
