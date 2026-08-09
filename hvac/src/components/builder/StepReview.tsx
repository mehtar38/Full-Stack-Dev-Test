import { Pencil, FileText, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { formatCurrency, displayText, formatDate } from '../../lib/normalize'
import { computeWorkItemTotals } from '../../lib/calc'
import Button from '../ui/Button'
import { Badge, Card } from '../ui/Primitives'

const JOB_TYPE_LABELS: Record<string, string> = {
  diagnostic: 'Diagnostic',
  repair: 'Repair',
  install: 'Installation',
  maintenance: 'Maintenance',
  ductwork: 'Ductwork',
}

const LEVEL_LABELS: Record<string, string> = {
  standard: 'Standard',
  complex: 'Complex',
  minor: 'Minor',
  major: 'Major',
  residential: 'Residential',
  commercial: 'Commercial',
  'mini-split': 'Mini-Split',
  comprehensive: 'Comprehensive',
  repair: 'Repair',
  'new-install': 'New Install',
}

export default function StepReview() {
  const { estimate, totals, workItems, goToStep, focusWorkItem, addWorkItem, removeWorkItem, approveReview, goNext } =
    useEstimate()

  function handleApprove() {
    approveReview()
    goNext()
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/50">
              Customer
            </div>
            <div className="font-display text-2xl font-bold leading-none mt-1">
              {estimate.customer.name}
            </div>
            <div className="text-sm text-[var(--color-ink)]/60 mt-1">
              {displayText(estimate.customer.address)} · {displayText(estimate.customer.phone)}
            </div>
          </div>
          <button
            onClick={() => goToStep('customer')}
            className="flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:underline flex-shrink-0"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      </Card>

      {workItems.map((wi, idx) => {
        const wiTotals = computeWorkItemTotals(wi)
        return (
          <Card key={wi.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/50">
                  Work Item {idx + 1}
                </div>
                <div className="font-display text-xl font-bold mt-1">
                  {wi.jobType ? JOB_TYPE_LABELS[wi.jobType] ?? wi.jobType : 'Untitled'}
                  {wi.labor && ` — ${LEVEL_LABELS[wi.labor.level] ?? wi.labor.level}`}
                </div>
                {wi.labor && (
                  <div className="text-sm text-[var(--color-ink)]/60">
                    {wi.labor.selectedHours} hrs @ {formatCurrency(wi.labor.hourlyRate)}/hr ={' '}
                    {formatCurrency(wiTotals.laborSubtotal)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => focusWorkItem(wi.id)}
                  className="flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:underline"
                >
                  <Pencil size={13} /> Edit
                </button>
                {workItems.length > 1 && (
                  <button
                    onClick={() => removeWorkItem(wi.id)}
                    title="Remove work item"
                    className="text-[var(--color-ink)]/40 hover:text-[var(--color-bad)]"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {wi.equipment.length === 0 ? (
              <p className="text-sm text-[var(--color-ink)]/50">No equipment on this work item.</p>
            ) : (
              <div className="divide-y divide-[var(--color-line)]">
                {wi.equipment.map((item) => (
                  <div key={item.lineId} className="py-2.5 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-sm">{item.instanceLabel}</div>
                      <div className="text-xs text-[var(--color-ink)]/60">
                        {displayText(item.brand)} {item.model ? `— ${item.model}` : ''}
                      </div>
                      {item.pricingSource === 'provisional-median' && (
                        <Badge tone="warn">Provisional pricing</Badge>
                      )}
                      {item.pricingSource === 'pending-office' && <Badge tone="bad">Pending office pricing</Badge>}
                    </div>
                    <span className="font-mono font-semibold flex-shrink-0">{formatCurrency(item.cost)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold pt-2.5 mt-2.5 border-t border-[var(--color-line)]">
              <span>Work item subtotal</span>
              <span className="font-mono">{formatCurrency(wiTotals.workItemSubtotal)}</span>
            </div>
          </Card>
        )
      })}

      <button
        onClick={addWorkItem}
        className="w-full border-2 border-dashed border-[var(--color-line)] rounded-sm py-3.5 flex items-center justify-center gap-2 font-semibold text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
      >
        <Plus size={18} /> Add Another Work Item
      </button>

      <Card>
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/50 mb-3">
          Discount
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-[var(--color-ink)]/70">
            <span>Equipment subtotal</span>
            <span className="font-mono">{formatCurrency(totals.equipmentSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--color-ink)]/70">
            <span>Labor subtotal</span>
            <span className="font-mono">{formatCurrency(totals.laborSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--color-ink)]/70">
            <span>Combined subtotal</span>
            <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--color-accent)]">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(totals.discount)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 mt-2 border-t border-[var(--color-line)]">
            <span className="font-display text-xl font-bold">Final Total</span>
            <span className="font-mono text-2xl font-bold">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </Card>

      {totals.hasProvisionalPricing && (
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-warn)] bg-[var(--color-warn-soft)] rounded-sm p-3">
          <AlertTriangle size={16} /> This estimate includes provisional (non-catalog) pricing.
        </div>
      )}

      <p className="text-xs text-[var(--color-ink)]/40">
        Estimate prepared {formatDate(estimate.createdAt)} · {estimate.id}
      </p>

      <div className="flex justify-end pt-2">
        <Button onClick={handleApprove} icon={<FileText size={17} />} size="lg">
          Show Customer Estimate
        </Button>
      </div>
    </div>
  )
}
