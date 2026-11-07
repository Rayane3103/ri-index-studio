import { t } from '../i18n'
import type { StepId } from '../types'

/** Friendly hints about order mistakes. They never block the user, they only warn.
 *  (Stemming + Lemmatization together is not a warning any more: the list does not allow it.) */
export function getPipelineWarnings(active: StepId[]): string[] {
  const pos = (id: StepId) => active.indexOf(id)
  const has = (id: StepId) => pos(id) !== -1
  const w = t.pipeline.warnings
  const warnings: string[] = []

  if (has('tag_cleaning') && pos('tag_cleaning') !== 0) warnings.push(w.tagsNotFirst)
  if (has('stopwords') && has('normalize') && pos('stopwords') < pos('normalize')) warnings.push(w.stopwordsBeforeNormalize)
  if (has('stopwords') && has('stem') && pos('stopwords') > pos('stem')) warnings.push(w.stopwordsAfterStem)
  if (has('stopwords') && has('lemmatize') && pos('stopwords') > pos('lemmatize')) warnings.push(w.stopwordsAfterStem)

  return [...new Set(warnings)]
}
