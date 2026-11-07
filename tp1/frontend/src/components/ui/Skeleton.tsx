/** Shimmering placeholder block. Size it with className (e.g. "h-4 w-32"). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />
}
