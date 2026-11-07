/** Human-readable memory size. Uses 1024-based units, like the OS does. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let i = 0
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`
}

export const formatInt = (n: number) => Math.round(n).toLocaleString('en-US')

/** "34×" style ratio, rounded to something readable. */
export function formatRatio(ratio: number): string {
  return ratio >= 10 ? ratio.toFixed(0) : ratio.toFixed(1)
}

/** "just now", "12 min ago", "3 h ago", or a short date for older times. */
export function formatWhen(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`
  return `on ${new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
}
