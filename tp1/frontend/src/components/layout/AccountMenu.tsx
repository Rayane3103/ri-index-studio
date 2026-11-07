import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { t } from '../../i18n'
import { navigate, usePath } from '../../lib/router'

/** Avatar with name and role. Opens a small menu: switch page (admin only) and log out. */
export function AccountMenu({ align = 'right', compact = false, up = false }: { align?: 'left' | 'right'; compact?: boolean; up?: boolean }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const path = usePath()

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const isAdmin = user.role === 'admin'
  const onAdminPage = path === '/admin'

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left transition-colors hover:bg-wash"
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white ${isAdmin ? 'bg-ink' : 'bg-blue'}`}
          aria-hidden
        >
          {user.name.slice(0, 1).toUpperCase()}
        </span>
        {!compact && (
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted">{isAdmin ? t.account.admin : t.account.user}</span>
          </span>
        )}
        <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={`absolute z-40 w-64 rounded-xl ${up ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} border border-line bg-paper p-1.5 shadow-lift ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            <p className="truncate px-3 pb-2 pt-1.5 text-xs text-muted">{user.email}</p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate(onAdminPage ? '/app' : '/admin')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-wash"
              >
                <ArrowLeftRight size={15} className="text-blue" aria-hidden />
                {onAdminPage ? t.account.userView : t.account.adminView}
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-wash"
            >
              <LogOut size={15} className="text-muted" aria-hidden />
              {t.account.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
