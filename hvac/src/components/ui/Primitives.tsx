import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={`bg-[var(--color-paper-raised)] border-2 border-[var(--color-ink)] rounded-sm ${padded ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

type BadgeTone = 'accent' | 'good' | 'warn' | 'bad' | 'neutral'

const badgeTones: Record<BadgeTone, string> = {
  accent: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  good: 'bg-[var(--color-good-soft)] text-[var(--color-good)]',
  warn: 'bg-[var(--color-warn-soft)] text-[var(--color-warn)]',
  bad: 'bg-[var(--color-bad-soft)] text-[var(--color-bad)]',
  neutral: 'bg-black/5 text-[var(--color-ink)]/70',
}

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wide ${badgeTones[tone]}`}
    >
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: ReactNode
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        {eyebrow && (
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-1">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl font-bold leading-none">{title}</h2>
      </div>
      {children}
    </div>
  )
}
