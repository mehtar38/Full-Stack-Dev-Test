import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, AlertTriangle, RotateCcw, Mail, Plus } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { laborLevelsForJobType } from '../../lib/data'
import { formatCurrency } from '../../lib/normalize'
import { buildLaborReviewMailto } from '../../lib/mailto'
import { clampHours } from '../../lib/calc'
import Button from '../ui/Button'
import { Card } from '../ui/Primitives'

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

export default function StepLabor() {
  const { jobType, labor, setLaborLevel, setLaborHours, goNext, goBack, customer, addWorkItem } = useEstimate()
  if (!jobType) return null
  const levels = laborLevelsForJobType(jobType)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {levels.map((rate) => {
          const selected = labor?.level === rate.level
          return (
            <button
              key={rate.level}
              onClick={() => setLaborLevel(rate.level)}
              className={`text-left p-4 rounded-sm border-2 transition-colors ${
                selected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-line)] bg-white hover:border-[var(--color-ink)]'
              }`}
            >
              <div className="font-display text-xl font-bold leading-none mb-1">
                {LEVEL_LABELS[rate.level] ?? rate.level}
              </div>
              <div className="text-sm text-[var(--color-ink)]/60 font-mono">
                {formatCurrency(rate.hourlyRate)}/hr · {rate.estimatedHours.min}–{rate.estimatedHours.max} hrs
              </div>
            </button>
          )
        })}
      </div>

      {labor && (
        <HoursControl
          jobType={jobType}
          level={LEVEL_LABELS[labor.level] ?? labor.level}
          hourlyRate={labor.hourlyRate}
          min={labor.minHours}
          max={labor.maxHours}
          value={labor.selectedHours}
          onChange={setLaborHours}
          customerName={customer?.name}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={goBack} icon={<ArrowLeft size={17} />}>
          Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {labor && (
            <Button variant="secondary" onClick={addWorkItem} icon={<Plus size={16} />}>
              Add Another Work Item
            </Button>
          )}
          <Button onClick={goNext} disabled={!labor} icon={<ArrowRight size={17} />}>
            Continue to Discount
          </Button>
        </div>
      </div>
    </div>
  )
}

function HoursControl({
  jobType,
  level,
  hourlyRate,
  min,
  max,
  value,
  onChange,
  customerName,
}: {
  jobType: string
  level: string
  hourlyRate: number
  min: number
  max: number
  value: number
  onChange: (hours: number) => void
  customerName?: string
}) {
  const { customer } = useEstimate()
  const [raw, setRaw] = useState(String(value))

  useEffect(() => {
    setRaw(String(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max])

  const rawNum = Number(raw)
  const outOfRange = raw !== '' && !Number.isNaN(rawNum) && (rawNum < min || rawNum > max)

  function handleRawChange(v: string) {
    setRaw(v)
    const n = Number(v)
    if (!Number.isNaN(n) && v !== '') onChange(n)
  }

  function resetToValid() {
    const clamped = clampHours(rawNum, min, max)
    setRaw(String(clamped))
    onChange(clamped)
  }

  const mailtoHref = buildLaborReviewMailto({
    customer,
    jobType,
    level,
    requestedHours: rawNum,
    min,
    max,
  })

  return (
    <Card className="animate-slide-up">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/70">
          Labor Hours
        </span>
        <span className="font-mono text-sm text-[var(--color-ink)]/60">
          Allowed range: {min} – {max} hrs
        </span>
      </div>

      <div className="flex items-center gap-4 mt-2">
        <input
          type="range"
          min={min}
          max={max}
          step={0.25}
          value={value}
          onChange={(e) => {
            setRaw(e.target.value)
            onChange(Number(e.target.value))
          }}
          className="flex-1"
        />
        <input
          type="number"
          step={0.25}
          value={raw}
          onChange={(e) => handleRawChange(e.target.value)}
          className={`w-24 rounded-sm border-2 px-2 py-1.5 text-right font-mono font-semibold outline-none ${
            outOfRange ? 'border-[var(--color-bad)]' : 'border-[var(--color-line)] focus:border-[var(--color-ink)]'
          }`}
        />
        <span className="text-sm text-[var(--color-ink)]/60 flex-shrink-0">hrs</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-[var(--color-ink)]/60">
          {value} hr × {formatCurrency(hourlyRate)}
        </span>
        <span className="font-mono text-lg font-bold">{formatCurrency(value * hourlyRate)}</span>
      </div>

      {outOfRange && (
        <div className="mt-4 border-2 border-dashed border-[var(--color-bad)] bg-[var(--color-bad-soft)] rounded-sm p-3">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-bad)] mb-2">
            <AlertTriangle size={15} /> {rawNum} hrs is outside the allowed {min}–{max} hr range for{' '}
            {customerName ?? 'this'} job
          </div>
          <p className="text-xs text-[var(--color-ink)]/70 mb-3">
            The estimate is using {value} hrs (clamped to the valid range) until this is resolved.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" icon={<RotateCcw size={14} />} onClick={resetToValid}>
              Reset to valid range
            </Button>
            <a href={mailtoHref}>
              <Button size="sm" variant="ghost" icon={<Mail size={14} />}>
                Request office review
              </Button>
            </a>
          </div>
        </div>
      )}
    </Card>
  )
}
