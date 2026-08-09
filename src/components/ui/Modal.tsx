import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--color-ink)]/70" onClick={onClose} />
      <div className="relative bg-white border-2 border-[var(--color-ink)] rounded-sm w-full max-w-sm p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-ink)]/50 hover:text-[var(--color-ink)] p-1"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
