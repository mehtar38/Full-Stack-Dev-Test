import { useState } from 'react'
import { ArrowRight, ArrowLeft, Tag } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { formatCurrency } from '../../lib/normalize'
import Button from '../ui/Button'
import { Card } from '../ui/Primitives'

export default function StepDiscount() {
  const { discount, setDiscount, totals, goNext, goBack } = useEstimate()
  const [raw, setRaw] = useState(discount ? String(discount) : '')

  const rawNum = Number(raw)
  const preDiscountSubtotal = totals.subtotal
  const tooHigh = raw !== '' && !Number.isNaN(rawNum) && rawNum > preDiscountSubtotal
  const negative = raw !== '' && !Number.isNaN(rawNum) && rawNum < 0

  function handleChange(v: string) {
    setRaw(v)
    const n = Number(v)
    if (!Number.isNaN(n) && v !== '') setDiscount(n)
    if (v === '') setDiscount(0)
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/70 mb-3">
          <Tag size={14} /> Discount Amount
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl font-bold text-[var(--color-ink)]/40">$</span>
          <input
            type="number"
            min={0}
            max={preDiscountSubtotal}
            step="0.01"
            value={raw}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="0.00"
            className={`flex-1 rounded-sm border-2 px-4 py-3 text-2xl font-mono font-bold outline-none ${
              tooHigh || negative
                ? 'border-[var(--color-bad)]'
                : 'border-[var(--color-line)] focus:border-[var(--color-ink)]'
            }`}
          />
        </div>

        {tooHigh && (
          <p className="mt-2 text-sm font-semibold text-[var(--color-bad)]">
            Discount can't exceed the subtotal of {formatCurrency(preDiscountSubtotal)}. Applying{' '}
            {formatCurrency(preDiscountSubtotal)} instead.
          </p>
        )}
        {negative && (
          <p className="mt-2 text-sm font-semibold text-[var(--color-bad)]">
            Discount can't be negative. Applying $0.00 instead.
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-[var(--color-line)] space-y-1.5">
          <div className="flex justify-between text-sm text-[var(--color-ink)]/60">
            <span>Subtotal</span>
            <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--color-accent)]">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(totals.discount)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1.5 mt-1.5 border-t border-[var(--color-line)]">
            <span className="font-display text-lg font-bold">Final Total</span>
            <span className="font-mono text-xl font-bold">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={goBack} icon={<ArrowLeft size={17} />}>
          Back
        </Button>
        <Button onClick={goNext} icon={<ArrowRight size={17} />}>
          Continue to Review
        </Button>
      </div>
    </div>
  )
}
