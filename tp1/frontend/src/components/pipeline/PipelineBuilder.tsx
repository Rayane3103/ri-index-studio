import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Workflow } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../i18n'
import type { usePipeline } from '../../hooks/usePipeline'
import { usePipelinePreview } from '../../hooks/usePipelinePreview'
import { getPipelineWarnings } from '../../lib/pipelineWarnings'
import type { DatasetId } from '../../types'
import { Button } from '../ui/Button'
import { SectionCard } from '../ui/SectionCard'
import { PipelineFlow } from './PipelineFlow'
import { PipelinePreview } from './PipelinePreview'
import { StepRow } from './StepRow'

interface Props {
  index: number
  dataset: DatasetId
  pipeline: ReturnType<typeof usePipeline>
  /** How many documents are loaded (null = none yet). Used by the "try it on a document" panel. */
  documentCount: number | null
}

export function PipelineBuilder({ index, dataset, pipeline, documentCount }: Props) {
  const preview = usePipelinePreview(dataset, pipeline.active, documentCount)
  const { items, active, lockReason, toggle, move, reset } = pipeline
  const [announcement, setAnnouncement] = useState('')
  const warnings = getPipelineWarnings(active)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (!over || dragged.id === over.id) return
    const from = items.findIndex((i) => i.id === dragged.id)
    const to = items.findIndex((i) => i.id === over.id)
    move(from, to)
  }

  const moveBy = (from: number, direction: -1 | 1) => {
    const to = from + direction
    move(from, to)
    setAnnouncement(t.pipeline.moved(t.steps[items[from].id].name, to + 1, items.length))
  }

  return (
    <SectionCard
      id="pipeline"
      index={index}
      icon={Workflow}
      title={t.pipeline.title}
      description={t.pipeline.description}
      aside={
        <Button variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onClick={reset} className="!px-3 !py-1.5 !text-[13px]">
          {t.pipeline.reset}
        </Button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <StepRow
                    key={item.id}
                    id={item.id}
                    enabled={item.enabled}
                    lockedReason={lockReason[item.id]}
                    position={i}
                    total={items.length}
                    onToggle={() => toggle(item.id)}
                    onMove={(d) => moveBy(i, d)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
        </div>

        <div className="min-w-0 lg:border-l lg:border-line lg:pl-8">
          <p className="num mb-5 text-sm text-muted">{t.pipeline.selectedCount(active.length)}</p>
          <PipelineFlow active={active} />
          <AnimatePresence initial={false}>
            {warnings.map((text) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-orange/50 px-3.5 py-2.5 text-[13px] text-ink">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-orange-strong" aria-hidden />
                  {text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <PipelinePreview documentCount={documentCount} preview={preview} />
    </SectionCard>
  )
}
