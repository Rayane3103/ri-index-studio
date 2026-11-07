import { motion } from 'framer-motion'
import { Check, Layers } from 'lucide-react'
import { t } from '../../i18n'
import { AccountMenu } from './AccountMenu'
import { SECTIONS, type SectionId } from './sections'

interface Props {
  active: string
  completed: Record<SectionId, boolean>
}

/** Left navigation on laptop screens. On phones, MobileNav is used instead. */
export function Sidebar({ active, completed }: Props) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col border-r border-line bg-paper px-5 py-7 lg:flex">
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-[10px] border-2 border-blue text-blue">
          <Layers size={18} strokeWidth={2} aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-semibold tracking-tight">{t.app.name}</p>
          <p className="text-xs text-muted">{t.app.tagline}</p>
        </div>
      </div>

      <nav aria-label={t.nav.menu} className="mt-10 flex flex-col gap-1">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? 'location' : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-blue-strong' : 'text-muted hover:text-ink'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-blue/40"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <Icon size={17} strokeWidth={1.8} className="relative" aria-hidden />
              <span className="relative flex-1">{label}</span>
              {completed[id] && (
                <span className="relative grid h-[18px] w-[18px] place-items-center rounded-full border border-blue/50 text-blue">
                  <Check size={11} strokeWidth={3} aria-label={t.nav.done} />
                </span>
              )}
            </a>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-line pt-4">
        <AccountMenu align="left" up />
      </div>
    </aside>
  )
}
