import type { DocumentSummary } from '../types'

export const TOTAL_DOCUMENTS = 21578

const SUBJECTS = [
  'Bahia cocoa', 'U.S. crude oil stocks', 'Japanese trade surplus', 'Brazilian coffee exports', 'West German money supply',
  'Canadian wheat harvest', 'Mexican debt talks', 'OPEC output quotas', 'British retail sales', 'Soviet grain purchases',
  'Australian wool prices', 'Treasury bill auction', 'Dollar yen rate', 'Gold mining shares', 'Soybean crush margins',
  'Argentine inflation', 'Sugar export tax', 'Bank of France rates', 'Copper warehouse stocks', 'U.S. housing starts',
]
const VERBS = ['rises', 'falls', 'steady', 'expected to climb', 'under pressure', 'revised higher', 'unchanged', 'jumps', 'slips', 'seen flat']
const BODIES = [
  'Prices moved in thin trading on Monday as dealers waited for official figures, analysts said.',
  'The ministry said the measure would take effect next month, subject to approval by parliament.',
  'Traders said the market remained cautious after last week’s sharp swings in the futures contracts.',
  'Officials told Reuters that talks would resume later this week, though no date has been set.',
  'The company reported higher quarterly earnings, helped by stronger export demand and lower costs.',
]

/** Small deterministic helper so the same id always gives the same fake document. */
function pick<T>(list: T[], seed: number): T {
  return list[Math.abs(seed) % list.length]
}

export function fakeDocument(id: number): DocumentSummary {
  const subject = pick(SUBJECTS, id * 7 + 3)
  const verb = pick(VERBS, id * 11 + 5)
  return {
    id,
    title: `${subject} ${verb}`.toUpperCase(),
    preview: pick(BODIES, id * 13 + 1),
  }
}

export function fakeDocuments(count: number): DocumentSummary[] {
  return Array.from({ length: count }, (_, i) => fakeDocument(i + 1))
}
