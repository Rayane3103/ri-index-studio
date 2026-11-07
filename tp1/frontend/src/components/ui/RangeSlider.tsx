import { formatInt } from '../../lib/format'

interface Props {
  label: string
  min: number
  max: number
  value: number
  /** Above this value the track is red: sliding there is refused. null = no limit. */
  limit: number | null
  invalid: boolean
  disabled?: boolean
  step?: number
  onChange: (value: number) => void
  /** Show the min, the limit and the max under the track. */
  showScale?: boolean
  limitLabel?: string
}

/** A slider whose track shows the value (blue), the allowed zone (grey) and the blocked zone past the limit (red). */
export function RangeSlider({ label, min, max, value, limit, invalid, disabled, step = 10, onChange, showScale, limitLabel }: Props) {
  const percent = (v: number) => ((Math.min(Math.max(v, min), max) - min) * 100) / (max - min || 1)
  const valuePos = percent(value)
  const limitPos = limit === null ? 100 : percent(limit)
  const fill = invalid ? 'rgb(var(--bad))' : 'rgb(var(--blue))'
  const track = `linear-gradient(to right, ${fill} 0 ${valuePos}%, rgb(var(--line)) ${valuePos}% ${limitPos}%, rgb(var(--bad) / 0.22) ${limitPos}% 100%)`

  return (
    <div className="min-w-0 flex-1">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={Math.min(value, max)}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range block w-full"
        style={{ background: track }}
      />
      {showScale && (
        <div className="num relative mt-2 h-4 text-xs text-muted" aria-hidden>
          <span className="absolute left-0">{formatInt(min)}</span>
          {limit !== null && limitPos < 100 && limitPos > 12 && limitPos < 85 && (
            <span className="absolute -translate-x-1/2 whitespace-nowrap font-medium text-bad" style={{ left: `${limitPos}%` }}>
              {limitLabel ?? formatInt(limit)}
            </span>
          )}
          <span className="absolute right-0">{formatInt(max)}</span>
        </div>
      )}
    </div>
  )
}

/** A slider range that leaves some red room past the limit, so trying to go further is possible (and refused). */
export function sliderMaxFor(limit: number, total: number) {
  return Math.min(total, Math.max(limit, Math.ceil((limit * 1.5) / 100) * 100))
}
