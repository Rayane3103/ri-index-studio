import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, GripVertical, Lock } from 'lucide-react'
import { useId } from 'react'
import { t } from '../../i18n'
import type { StepId } from '../../types'

interface Props {
  id: StepId
  enabled: boolean
  /** Why the step cannot be ticked now (null = it can). Shown as a tooltip and to screen readers. */
  lockedReason: string | null
  position: number
  total: number
  onToggle: () => void
  onMove: (direction: -1 | 1) => void
}

/** One draggable step: handle, checkbox, name, and up/down buttons for keyboard users.
 *  A locked step is greyed out with a lock icon: it can still be moved, but not ticked. */
export function StepRow({ id, enabled, lockedReason, position, total, onToggle, onMove }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id })
  const { name, hint } = t.steps[id]
  const reasonId = useId()
  const locked = lockedReason !== null

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className="relative list-none"
    >
      {/* The inner box lifts with a spring while it is dragged. */}
      <motion.div
        animate={{ scale: isDragging ? 1.025 : 1, y: isDragging ? -2 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className={`flex items-center gap-2 rounded-2xl border bg-paper px-2.5 py-2.5 transition-[border-color,box-shadow] sm:gap-3 sm:px-3 ${
          isDragging ? 'border-blue shadow-lift' : enabled ? 'border-blue/45 shadow-sm' : 'border-line'
        } ${locked && !isDragging ? 'border-dashed bg-wash' : ''}`}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={t.pipeline.dragHandle(name)}
          className={`grid h-9 w-8 shrink-0 touch-none place-items-center rounded-lg text-faint hover:text-blue ${
            isDragging ? 'cursor-grabbing text-blue' : 'cursor-grab'
          }`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} aria-hidden />
        </button>

        <label className={`group/lock relative flex min-w-0 flex-1 items-center gap-3 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={onToggle}
            disabled={locked}
            aria-label={t.pipeline.enable(name)}
            aria-describedby={locked ? reasonId : undefined}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
              locked ? 'border-line bg-line/70 text-muted' : enabled ? 'border-blue text-blue' : 'border-line text-transparent'
            }`}
          >
            {locked ? (
              <Lock size={11} strokeWidth={2.6} />
            ) : (
              <motion.span initial={false} animate={{ scale: enabled ? 1 : 0.4, opacity: enabled ? 1 : 0 }} transition={{ type: 'spring', stiffness: 600, damping: 25 }}>
                <Check size={14} strokeWidth={3.5} />
              </motion.span>
            )}
          </span>
          <span className={`min-w-0 ${locked ? 'opacity-55' : ''}`}>
            <span className={`block text-sm font-medium ${enabled ? 'text-ink' : 'text-muted'}`}>{name}</span>
            <span className="block text-[13px] leading-snug text-muted">{hint}</span>
          </span>
          {locked && (
            <span
              id={reasonId}
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-8 z-30 mb-2 w-max max-w-[260px] translate-y-1 rounded-lg bg-ink px-3 py-2 text-[12.5px] leading-snug text-white opacity-0 shadow-lift transition duration-150 group-hover/lock:translate-y-0 group-hover/lock:opacity-100 group-focus-within/lock:translate-y-0 group-focus-within/lock:opacity-100"
            >
              {lockedReason}
            </span>
          )}
        </label>

        <div className="flex shrink-0 flex-col">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={position === 0}
            aria-label={t.pipeline.moveUp(name)}
            className="grid h-[18px] w-8 place-items-center rounded text-muted hover:text-blue disabled:opacity-25 disabled:hover:text-muted"
          >
            <ChevronUp size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={position === total - 1}
            aria-label={t.pipeline.moveDown(name)}
            className="grid h-[18px] w-8 place-items-center rounded text-muted hover:text-blue disabled:opacity-25 disabled:hover:text-muted"
          >
            <ChevronDown size={16} aria-hidden />
          </button>
        </div>
      </motion.div>
    </li>
  )
}
