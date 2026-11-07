import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'key' | 'outline' | 'ghost'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
}

// blue = main actions, orange (key) = the one highlight action, outline/ghost = quiet actions
const styles: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-strong shadow-sm',
  key: 'bg-orange-strong text-white shadow-glow hover:brightness-110',
  outline: 'bg-paper text-ink border border-line hover:border-blue hover:text-blue-strong',
  ghost: 'bg-transparent text-muted hover:text-ink hover:bg-wash',
}

export function Button({ variant = 'primary', icon, children, className = '', disabled, ...rest }: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
        transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}
