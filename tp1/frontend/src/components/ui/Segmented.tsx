import { motion } from 'framer-motion'
import { useId } from 'react'

interface Option<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

/** Small two/three-way switch (radio group). The blue outline slides to the chosen option. */
export function Segmented<T extends string>({ label, options, value, onChange }: Props<T>) {
  const group = useId()
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl border border-line p-0.5">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            {selected && (
              <motion.span
                layoutId={`seg-${group}`}
                className="absolute inset-0 rounded-[10px] border border-blue"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span
              className={`relative block rounded-[10px] px-3 py-1.5 text-[13px] font-medium transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue ${
                selected ? 'text-blue-strong' : 'text-muted hover:text-ink'
              }`}
            >
              {o.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
