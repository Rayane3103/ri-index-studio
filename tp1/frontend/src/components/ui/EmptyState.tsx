import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  body: string
}

/** Dashed, quiet placeholder shown when there is nothing to display yet. */
export function EmptyState({ icon: Icon, title, body }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      <Icon size={22} strokeWidth={1.6} className="text-faint" aria-hidden />
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="max-w-xs text-sm text-muted">{body}</p>
    </div>
  )
}
