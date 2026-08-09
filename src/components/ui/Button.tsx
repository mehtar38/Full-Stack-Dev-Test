import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink-soft)] active:translate-y-px',
  secondary:
    'bg-white text-[var(--color-ink)] border-2 border-[var(--color-ink)] hover:bg-[var(--color-paper)] active:translate-y-px',
  ghost: 'bg-transparent text-[var(--color-ink)] hover:bg-black/5 active:translate-y-px',
  danger:
    'bg-white text-[var(--color-bad)] border-2 border-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] active:translate-y-px',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-[15px] px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3.5 gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
