import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from 'react'

/**
 * Lets the user type a number freely ("4", "45", "450") and only applies it on Enter or when leaving the field,
 * so the value is not clamped after every key. A number above `limit` is applied at once (to show the red message).
 * `commit` returns the value really applied (after clamping), which the field then shows.
 */
export function useNumberDraft(value: number, commit: (n: number) => number, limit: number) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => setDraft(String(value)), [value])

  const apply = (text: string) => {
    const parsed = Number(text)
    setDraft(String(text.trim() === '' || !Number.isFinite(parsed) ? value : commit(parsed)))
  }

  return {
    value: draft,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value
      if (Number(text) > limit) apply(text)
      else setDraft(text)
    },
    onBlur: () => apply(draft),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') apply(draft)
    },
  }
}
