import { AlertTriangle } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { formatCurrency } from '../../lib/normalize'
import { Badge } from '../ui/Primitives'

const JOB_TYPE_LABELS: Record<string, string> = {
  diagnostic: 'Diagnostic',
  repair: 'Repair',
  install: 'Installation',
  maintenance: 'Maintenance',
  ductwork: 'Ductwork',
}

export default function EstimateSummary() {
  const { estimate, totals, workItems } = useEstimate()

  return (
    <div className="bg-(--color-ink) text-white rounded-sm border-2 border-(--color-ink) sticky top-20 overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-white/15">
        <div className="text-xs font-bold uppercase tracking-widest text-(--color-accent)">
          Estimate
        </div>
        <div className="font-display text-2xl font-bold leading-tight">
          {estimate.customer.name || 'No customer selected'}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {workItems.length === 0 && (
          <p className="text-sm text-white/50">
            Select a customer and job details to start building the estimate.
          </p>
        )}

        {workItems.map((wi, idx) => (
          <div key={wi.id} className={idx > 0 ? 'pt-3 border-t border-white/10' : ''}>
            {workItems.length > 1 && (
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-2">
                Work Item {idx + 1} — {wi.jobType ? JOB_TYPE_LABELS[wi.jobType] ?? wi.jobType : 'Untitled'}
              </div>
            )}

            {wi.equipment.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                 Equipment
                </div>
                <div className="space-y-1.5">
                  {wi.equipment.map((item) => (
                    <div key={item.lineId} className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-white/85 leading-snug">
                        {item.instanceLabel}
                        {item.pricingSource === 'provisional-median' && (
                          <span className="block text-[10px] uppercase tracking-wide text-[var(--color-accent)] font-bold">
                            provisional
                          </span>
                        )}
                        {item.pricingSource === 'pending-office' && (
                          <span className="block text-[10px] uppercase tracking-wide text-yellow-400 font-bold">
                            pending office pricing
                          </span>
                        )}
                      </span>
                      <span className="font-mono flex-shrink-0">{formatCurrency(item.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {wi.labor && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white/50 mb-2">
                   Labor
                </div>
                <div className="flex items-start justify-between gap-2 text-sm">
                  <span className="text-white/85 leading-snug">
                    {wi.jobType} — {wi.labor.level}
                    <span className="block text-white/50 text-xs">
                      {wi.labor.selectedHours} hrs @ {formatCurrency(wi.labor.hourlyRate)}/hr
                    </span>
                  </span>
                  <span className="font-mono flex-shrink-0">
                    {formatCurrency(wi.labor.hourlyRate * wi.labor.selectedHours)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 py-4 border-t border-white/15 space-y-1.5 bg-white/[0.04]">
        <div className="flex justify-between text-sm text-white/70">
          <span>Equipment subtotal</span>
          <span className="font-mono">{formatCurrency(totals.equipmentSubtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>Labor subtotal</span>
          <span className="font-mono">{formatCurrency(totals.laborSubtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-white/70">
          <span>Subtotal</span>
          <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-sm text-[var(--color-accent)]">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-white/15">
          <span className="font-display text-lg font-bold">Total</span>
          <span className="font-mono text-2xl font-bold">{formatCurrency(totals.total)}</span>
        </div>
        {totals.hasProvisionalPricing && (
          <div className="pt-1">
            <Badge tone="warn">
              <AlertTriangle size={11} /> Includes provisional pricing
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

export function MobileTotalBar() {
  const { totals, step } = useEstimate()
  if (step === 'customer-view') return null
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--color-ink)] text-white border-t-2 border-[var(--color-accent)] px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
      <span className="text-xs font-bold uppercase tracking-wide text-white/60">
        Estimated Total
      </span>
      <span className="font-mono text-lg font-bold">{formatCurrency(totals.total)}</span>
    </div>
  )
}
