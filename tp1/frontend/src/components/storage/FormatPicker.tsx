import { motion } from 'framer-motion'
import { Braces, Binary, FileText, type LucideIcon } from 'lucide-react'
import { useId } from 'react'
import { t } from '../../i18n'
import type { SaveFormat } from '../../types'

const OPTIONS: { value: SaveFormat; icon: LucideIcon }[] = [
  { value: 'json', icon: Braces },
  { value: 'text', icon: FileText },
  { value: 'binary', icon: Binary },
]

interface Props {
  value: SaveFormat
  onChange: (format: SaveFormat) => void
  disabled: boolean
}

/** Three selectable cards (radio group). The chosen one gets a blue outline. */
export function FormatPicker({ value, onChange, disabled }: Props) {
  const group = useId()
  return (
    <fieldset disabled={disabled} className="min-w-0 border-0 p-0">
      <legend className="mb-3 text-sm font-medium">{t.storage.formatLabel}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {OPTIONS.map(({ value: v, icon: Icon }) => {
          const selected = v === value
          const info = t.storage.formats[v]
          return (
            <label
              key={v}
              className={`relative block cursor-pointer rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                selected ? 'border-blue' : 'border-line hover:border-faint'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input type="radio" name={group} value={v} checked={selected} onChange={() => onChange(v)} className="sr-only" />
              {selected && (
                <motion.span
                  layoutId={`format-${group}`}
                  className="absolute inset-0 rounded-2xl border-2 border-blue"
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  aria-hidden
                />
              )}
              <Icon size={20} strokeWidth={1.7} className={`relative ${selected ? 'text-blue' : 'text-muted'}`} aria-hidden />
              <span className="relative mt-3 block text-sm font-semibold">{info.name}</span>
              <span className="relative mt-0.5 block text-[13px] text-muted">{info.hint}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
