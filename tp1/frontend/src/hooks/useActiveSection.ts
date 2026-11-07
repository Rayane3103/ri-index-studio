import { useEffect, useState } from 'react'

/** Returns the id of the section currently near the top of the viewport (for the sidebar highlight). */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight * 0.4
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      }
      // At the very bottom of the page, the last section wins.
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = ids[ids.length - 1]
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
