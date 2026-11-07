// One scale decides where bars, gridlines and tick labels go, so they always agree.
export interface Tick {
  value: number
  /** Position along the plot, 0..100 (percent). */
  pos: number
  label: string
}

export interface Scale {
  ticks: Tick[]
  /** Maps a byte value to 0..100 (percent of the plot width). */
  toPos: (value: number) => number
}

const UNITS = ['B', 'KB', 'MB', 'GB']

function tickLabel(bytes: number): string {
  if (bytes === 0) return '0'
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024) + 1e-9), UNITS.length - 1)
  const v = bytes / 1024 ** i
  return `${Number(v.toFixed(1))} ${UNITS[i]}`
}

/** Linear scale from 0 to a "nice" maximum, with about 4 steps. */
export function linearScale(maxValue: number): Scale {
  const unit = 1024 ** Math.min(Math.floor(Math.log(Math.max(maxValue, 1)) / Math.log(1024)), UNITS.length - 1)
  const raw = maxValue / unit / 4
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].find((n) => n * magnitude >= raw) ?? 10) * magnitude * unit
  const count = Math.ceil(maxValue / step)
  const niceMax = count * step
  const ticks = Array.from({ length: count + 1 }, (_, i) => ({
    value: i * step,
    pos: (i * step * 100) / niceMax,
    label: tickLabel(i * step),
  }))
  return { ticks, toPos: (v) => (v * 100) / niceMax }
}

/** Log scale with gridlines at 1, 10, 100 × 1 KB, 1 MB, … so each line is about 10 times the previous. */
export function logScale(minValue: number, maxValue: number): Scale {
  const candidates: number[] = []
  for (let k = 0; k < UNITS.length; k++) for (const m of [1, 10, 100]) candidates.push(m * 1024 ** k)
  const sorted = [...new Set(candidates)].sort((a, b) => a - b)
  const lowIndex = Math.max(sorted.filter((c) => c <= minValue).length - 1, 0)
  const highIndex = Math.min(sorted.findIndex((c) => c >= maxValue), sorted.length - 1)
  const low = sorted[lowIndex]
  const high = sorted[Math.max(highIndex, lowIndex + 1)]
  const span = Math.log(high) - Math.log(low)
  const toPos = (v: number) => Math.min(Math.max(((Math.log(Math.max(v, low)) - Math.log(low)) * 100) / span, 1.5), 100)
  const ticks = sorted
    .filter((c) => c >= low && c <= high)
    .map((c) => ({ value: c, pos: ((Math.log(c) - Math.log(low)) * 100) / span, label: tickLabel(c) }))
  return { ticks, toPos }
}
