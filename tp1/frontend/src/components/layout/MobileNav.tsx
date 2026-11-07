import { Check, Layers } from 'lucide-react'
import { t } from '../../i18n'
import { AccountMenu } from './AccountMenu'
import { SECTIONS, type SectionId } from './sections'

interface Props {
  active: string
  completed: Record<SectionId, boolean>
}

/** Sticky top bar for phones and tablets: logo plus a horizontally scrollable list of sections. */
export function MobileNav({ active, completed }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5 px-4 pt-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-blue text-blue">
          <Layers size={14} strokeWidth={2} aria-hidden />
        </span>
        <p className="flex-1 text-sm font-semibold tracking-tight">{t.app.name}</p>
        <AccountMenu compact />
      </div>
      <nav aria-label={t.nav.menu} className="thin-scroll flex gap-1.5 overflow-x-auto px-4 pb-3 pt-2.5">
        {SECTIONS.map(({ id, label }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? 'location' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                isActive ? 'border-blue text-blue-strong' : 'border-line text-muted'
              }`}
            >
              {label}
              {completed[id] && <Check size={12} strokeWidth={3} className="text-blue" aria-label={t.nav.done} />}
            </a>
          )
        })}
      </nav>
    </header>
  )
}
