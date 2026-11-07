import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { t } from '../../i18n'
import { linearScale, logScale } from '../../lib/chartScale'
import { formatBytes, formatRatio } from '../../lib/format'
import type { Metrics, StructureId } from '../../types'
import { MODEL_IDS } from '../../types'
import { Segmented } from '../ui/Segmented'

type ScaleMode = 'linear' | 'log'
type MatrixKind = Extract<StructureId, 'doc_term_matrix' | 'term_doc_matrix'>

const LABEL_GUTTER = 84 // room on the right of the plot for value labels (px)

/** Grouped horizontal bars: matrix (orange) against inverted index (blue), one group per model. */
export function MemoryChart({ metrics }: { metrics: Metrics }) {
  const [mode, setMode] = useState<ScaleMode>('linear')
  const [matrixKind, setMatrixKind] = useState<MatrixKind>('doc_term_matrix')
  const [hovered, setHovered] = useState<string | null>(null)

  const rows = MODEL_IDS.map((m) => ({
    model: m,
    matrix: metrics.memory[m][matrixKind],
    inverted: metrics.memory[m].inverted_index,
  }))
  const all = rows.flatMap((r) => [r.matrix, r.inverted])
  const scale = useMemo(
    () => (mode === 'linear' ? linearScale(Math.max(...all)) : logScale(Math.min(...all), Math.max(...all))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, matrixKind, metrics],
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">{t.metrics.chartTitle}</h3>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted" aria-label="Legend">
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-full bg-orange" aria-hidden />
              {t.metrics.matrixSeries}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2.5 w-5 rounded-full bg-blue" aria-hidden />
              {t.metrics.invertedSeries}
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Segmented
            label={t.metrics.matrixOrientation}
            value={matrixKind}
            onChange={setMatrixKind}
            options={[
              { value: 'doc_term_matrix', label: t.structures.doc_term_matrix.short },
              { value: 'term_doc_matrix', label: t.structures.term_doc_matrix.short },
            ]}
          />
          <Segmented
            label={t.metrics.scale}
            value={mode}
            onChange={setMode}
            options={[
              { value: 'linear', label: t.metrics.linear },
              { value: 'log', label: t.metrics.log },
            ]}
          />
        </div>
      </div>

      <div role="img" aria-label={t.metrics.chartTitle} className="flex flex-col gap-1">
        {rows.map(({ model, matrix, inverted }) => {
          const name = t.models[model].name
          const dim = hovered !== null && hovered !== model
          return (
            <div
              key={model}
              onMouseEnter={() => setHovered(model)}
              onMouseLeave={() => setHovered(null)}
              title={t.metrics.chartLabel(name, formatBytes(matrix), formatBytes(inverted))}
              className={`grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 rounded-xl py-2.5 transition-opacity sm:grid-cols-[88px_minmax(0,1fr)] ${
                dim ? 'opacity-45' : ''
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="num text-xs text-blue-strong">{t.metrics.smaller(formatRatio(matrix / inverted))}</p>
              </div>
              <div className="relative">
                {/* gridlines */}
                <div className="pointer-events-none absolute inset-y-[-10px] left-0" style={{ right: LABEL_GUTTER }} aria-hidden>
                  {scale.ticks.map((tick) => (
                    <div key={tick.value} className="absolute inset-y-0 w-px bg-line" style={{ left: `${tick.pos}%` }} />
                  ))}
                </div>
                <div className="relative flex flex-col gap-1.5" style={{ paddingRight: LABEL_GUTTER }}>
                  <Bar value={matrix} pos={scale.toPos(matrix)} color="bg-orange" />
                  <Bar value={inverted} pos={scale.toPos(inverted)} color="bg-blue" />
                </div>
              </div>
            </div>
          )
        })}

        {/* axis labels */}
        <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_minmax(0,1fr)]" aria-hidden>
          <span />
          <div className="relative h-5" style={{ marginRight: LABEL_GUTTER }}>
            {scale.ticks.map((tick, i) => (
              <span
                key={tick.value}
                className="num absolute top-0 whitespace-nowrap text-[11px] text-muted"
                style={{ left: `${tick.pos}%`, transform: i === 0 ? 'none' : 'translateX(-50%)' }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      {mode === 'log' && <p className="mt-3 text-xs text-muted">{t.metrics.logNote}</p>}
    </div>
  )
}

function Bar({ value, pos, color }: { value: number; pos: number; color: string }) {
  return (
    <div className="flex h-[14px] items-center">
      <motion.div
        className={`h-full shrink-0 rounded-r-[5px] ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pos}%` }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        style={{ minWidth: 3 }}
      />
      <span className="num ml-2 whitespace-nowrap text-xs font-medium text-ink">{formatBytes(value)}</span>
    </div>
  )
}
