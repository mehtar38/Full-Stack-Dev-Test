import { useState } from 'react'
import { Flame, ArrowLeft, Download, PenLine, Loader2 } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { formatCurrency, formatDate, displayText } from '../../lib/normalize'
import { buildWorkItemSections } from '../../lib/calc'
import Button from '../ui/Button'

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

export default function CustomerEstimateView() {
  const { estimate, totals, technicianName, goToStep } = useEstimate()
  const sections = buildWorkItemSections(estimate)
  const multipleWorkItems = sections.length > 1
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)
    try {
      const { generateEstimatePdf } = await import('../../lib/pdf')
      generateEstimatePdf(estimate, totals)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={() => goToStep('review')}
          className="flex items-center gap-1.5 text-sm font-semibold text-(--color-ink)/60 hover:text-(--color-ink)"
        >
          <ArrowLeft size={15} /> Back to review
        </button>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<PenLine size={14} />} onClick={() => goToStep('review')}>
            Edit
          </Button>
          <Button
            size="sm"
            icon={generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? 'Preparing…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-(--color-ink) rounded-sm overflow-hidden">
        {/* Letterhead */}
        <div className="bg-(--color-ink) text-white px-6 sm:px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-(--color-accent) flex items-center justify-center shrink-0">
              <Flame size={22} className="text-white" />
            </div>
            <div>
              <div className="font-display text-2xl font-bold leading-none">SUMMIT AIR</div>
              <div className="text-[11px] uppercase tracking-widest text-white/60">
                Heating &amp; Cooling Co.
              </div>
            </div>
          </div>
          <div className="text-right text-xs text-white/60 hidden sm:block">
            <div>2140 Industrial Pkwy, Springfield, IL</div>
            <div>(217) 555-0100 · office@summitair.example</div>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-8">
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-(--color-line)">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-(--color-ink)/40 mb-1">
                Prepared For
              </div>
              <div className="font-display text-2xl font-bold">{estimate.customer.name}</div>
              <div className="text-sm text-[var(--color-ink)]/60 mt-0.5">
                {displayText(estimate.customer.address)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink)]/40 mb-1">
                Estimate Date
              </div>
              <div className="font-mono font-semibold">{formatDate(estimate.createdAt)}</div>
              <div className="text-xs text-[var(--color-ink)]/40 mt-1 font-mono">{estimate.id}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink)]/40 mt-3 mb-1">
                Prepared By
              </div>
              <div className="font-semibold">{technicianName || 'Not specified'}</div>
            </div>
          </div>

          <div className="space-y-8 mb-8">
            {sections.map((section, i) => {
              const wi = section.workItem
              const jobLabel = wi.jobType ? JOB_TYPE_LABELS[wi.jobType] ?? wi.jobType : 'Service'
              return (
                <div key={wi.id}>
                  <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
                    {multipleWorkItems ? `Work Item ${i + 1} — ${jobLabel}` : `${jobLabel} Service`}
                  </div>

                  <div className="space-y-2">
                    {wi.equipment.map((item) => (
                      <div
                        key={item.lineId}
                        className="flex items-start justify-between gap-4 py-2 border-b border-dashed border-[var(--color-line)]"
                      >
                        <div>
                          <div className="font-semibold">{item.model ?? item.instanceLabel}</div>
                          <div className="text-xs text-[var(--color-ink)]/50">
                            {displayText(item.brand)}
                            {item.pricingSource === 'provisional-median' && (
                              <span className="ml-2 text-[var(--color-warn)] font-bold uppercase tracking-wide">
                                Provisional pricing
                              </span>
                            )}
                            {item.pricingSource === 'pending-office' && (
                              <span className="ml-2 text-[var(--color-bad)] font-bold uppercase tracking-wide">
                                Pending office pricing
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono font-semibold flex-shrink-0">{formatCurrency(item.cost)}</span>
                      </div>
                    ))}

                    {wi.labor && (
                      <div className="flex items-start justify-between gap-4 py-2 border-b border-dashed border-[var(--color-line)]">
                        <div>
                          <div className="font-semibold">
                            Labor — {jobLabel} ({LEVEL_LABELS[wi.labor.level] ?? wi.labor.level})
                          </div>
                          <div className="text-xs text-[var(--color-ink)]/50">
                            {wi.labor.selectedHours} hrs @ {formatCurrency(wi.labor.hourlyRate)}/hr
                          </div>
                        </div>
                        <span className="font-mono font-semibold flex-shrink-0">
                          {formatCurrency(section.totals.laborSubtotal)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-sm font-semibold mt-2">
                    <span className="text-[var(--color-ink)]/60">Work item subtotal</span>
                    <span className="font-mono">{formatCurrency(section.totals.workItemSubtotal)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-1.5 pt-4 border-t-2 border-[var(--color-ink)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-ink)]/60">Combined Subtotal</span>
              <span className="font-mono">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-sm text-[var(--color-accent)]">
                <span>Discount</span>
                <span className="font-mono">-{formatCurrency(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-display text-2xl font-bold">Estimated Total</span>
              <span className="font-mono text-3xl font-bold">{formatCurrency(totals.total)}</span>
            </div>
          </div>

          <p className="text-xs text-[var(--color-ink)]/40 mt-8 pt-4 border-t border-[var(--color-line)] leading-relaxed">
            This is an estimate, not a final invoice. Final pricing may vary based on conditions
            found during service.
            {totals.hasProvisionalPricing &&
              ' Items marked "provisional pricing" use a category median in place of a confirmed catalog price and are subject to change.'}
            {' '}Estimate valid for 30 days from the date above.
          </p>
        </div>
      </div>
    </div>
  )
}
