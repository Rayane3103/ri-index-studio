import type { Metrics, ModelId, StepId, StructureId } from '../types'
import { MODEL_IDS, STRUCTURE_IDS } from '../types'

/** Rough effect of each pipeline step on the vocabulary size. */
const VOCAB_FACTOR: Record<StepId, number> = {
  tag_cleaning: 0.98,
  normalize: 0.62,
  stopwords: 0.99,
  stem: 0.74,
  lemmatize: 0.86,
}

/** How much heavier each model is than plain counts (floats cost more than small ints). */
const MODEL_WEIGHT: Record<ModelId, { matrix: number; inverted: number }> = {
  bow: { matrix: 0.9, inverted: 0.78 },
  f: { matrix: 1, inverted: 1 },
  tf: { matrix: 1.16, inverted: 1.12 },
  tfidf: { matrix: 1.17, inverted: 1.14 },
}

/** Small stable "noise" so the numbers do not look machine-made. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return 0.97 + (x - Math.floor(x)) * 0.06
}

/** Fake metrics that behave like real ones: Heaps' law for the vocabulary, dense matrices vs sparse postings. */
export function buildFakeMetrics(nDocs: number, pipeline: StepId[]): Metrics {
  const rawVocab = 600 * Math.pow(nDocs, 0.45)
  const vocab = Math.round(pipeline.reduce((v, step) => v * VOCAB_FACTOR[step], rawVocab * 2.2))
  const postings = nDocs * 52

  const memory = {} as Metrics['memory']
  MODEL_IDS.forEach((model, mi) => {
    const row = {} as Record<StructureId, number>
    STRUCTURE_IDS.forEach((structure, si) => {
      const j = jitter(mi * 10 + si + nDocs)
      if (structure === 'inverted_index') {
        row[structure] = Math.round((postings * 20 + vocab * 48) * MODEL_WEIGHT[model].inverted * j)
      } else {
        const skew = structure === 'term_doc_matrix' ? 1.03 : 1
        row[structure] = Math.round((nDocs * vocab * 8 + (nDocs + vocab) * 64) * MODEL_WEIGHT[model].matrix * skew * j)
      }
    })
    memory[model] = row
  })

  return { vocabulary_size: vocab, documents_indexed: nDocs, memory }
}
