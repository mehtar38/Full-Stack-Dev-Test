import { Check } from 'lucide-react'
import { useEstimate, type WizardStep } from '../../context/EstimateContext'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'customer', label: 'Customer' },
  { key: 'work', label: 'Work' },
  { key: 'discount', label: 'Discount' },
  { key: 'review', label: 'Review' },
]

export default function StepTracker() {
  const { step, goToStep, canAccessStep } = useEstimate()
  const currentIdx = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="flex items-center overflow-x-auto no-scrollbar -mx-1 px-1">
      {STEPS.map((s, i) => {
        const isDone = i < currentIdx
        const isCurrent = s.key === step
        const accessible = canAccessStep(s.key)
        return (
          <div key={s.key} className="flex items-center flex-shrink-0">
            <button
              type="button"
              disabled={!accessible}
              onClick={() => goToStep(s.key)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                isCurrent
                  ? 'bg-[var(--color-ink)] text-white'
                  : accessible
                    ? 'text-[var(--color-ink)] hover:bg-black/5'
                    : 'text-[var(--color-ink)]/30 cursor-not-allowed'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold flex-shrink-0 ${
                  isCurrent
                    ? 'bg-[var(--color-accent)] text-white'
                    : isDone
                      ? 'bg-[var(--color-good)] text-white'
                      : 'bg-black/10 text-[var(--color-ink)]/60'
                }`}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="text-sm font-semibold">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="w-4 h-px bg-[var(--color-line)] mx-0.5" />}
          </div>
        )
      })}
    </div>
  )
}
