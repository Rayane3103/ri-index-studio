import { animate, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  format?: (n: number) => string
  duration?: number
}

/** Counts up from the previous value to the new one. Shows the final value right away if motion is reduced. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('en-US'), duration = 1.1 }: Props) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? value : 0)
  const previous = useRef(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setShown(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(v),
      onComplete: () => (previous.current = value),
    })
    return () => controls.stop()
  }, [value, duration, reduce])

  return <span className="num">{format(shown)}</span>
}
