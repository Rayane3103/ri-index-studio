import { t } from '../../i18n'
import { formatBytes } from '../../lib/format'
import type { Metrics } from '../../types'
import { MODEL_IDS, STRUCTURE_IDS } from '../../types'

/** The same numbers as the chart, as plain text. Good for reading exact values and for screen readers. */
export function MemoryTable({ metrics }: { metrics: Metrics }) {
  return (
    <div>
      <h3 className="mb-3 text-[15px] font-semibold tracking-tight">{t.metrics.tableTitle}</h3>
      <div className="thin-scroll overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[13px] text-muted">
              <th scope="col" className="px-4 py-3 font-medium">{t.metrics.colModel}</th>
              {STRUCTURE_IDS.map((s) => (
                <th key={s} scope="col" className="px-4 py-3 text-right font-medium">{t.structures[s].name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODEL_IDS.map((m) => (
              <tr key={m} className="border-b border-line last:border-0">
                <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold">{t.models[m].name}</th>
                {STRUCTURE_IDS.map((s) => (
                  <td
                    key={s}
                    className={`num px-4 py-3 text-right ${s === 'inverted_index' ? 'font-medium text-blue-strong' : 'text-ink'}`}
                  >
                    {formatBytes(metrics.memory[m][s])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
