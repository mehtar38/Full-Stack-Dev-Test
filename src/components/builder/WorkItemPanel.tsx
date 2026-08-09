import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Stethoscope,
  Hammer,
  PackagePlus,
  ShieldCheck,
  Wind,
  AlertTriangle,
  RotateCcw,
  Mail,
  PackageOpen,
} from 'lucide-react'
import type { WorkItem } from '../../types'
import { useEstimate } from '../../context/EstimateContext'
import { laborJobTypes, laborLevelsForJobType } from '../../lib/data'
import { formatCurrency } from '../../lib/normalize'
import { buildLaborReviewMailto } from '../../lib/mailto'
import { clampHours, blankLineItem, computeWorkItemTotals } from '../../lib/calc'
import Button from '../ui/Button'
import EquipmentCard from './EquipmentCard'

const JOB_TYPE_META: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  diagnostic: { label: 'Diagnostic', description: 'Inspect and identify the issue', icon: <Stethoscope size={22} /> },
  repair: { label: 'Repair', description: 'Fix an existing system', icon: <Hammer size={22} /> },
  install: { label: 'Installation', description: 'New equipment install', icon: <PackagePlus size={22} /> },
  maintenance: { label: 'Maintenance', description: 'Routine service & tune-up', icon: <ShieldCheck size={22} /> },
  ductwork: { label: 'Ductwork', description: 'Duct repair or new install', icon: <Wind size={22} /> },
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

export default function WorkItemPanel({
  workItem,
  index,
  canRemove,
}: {
  workItem: WorkItem
  index: number
  canRemove: boolean
}) {
  const { focusWorkItemId, removeWorkItem, setJobType, addEquipment } = useEstimate()
  const [expanded, setExpanded] = useState(workItem.id === focusWorkItemId)

  const totals = computeWorkItemTotals(workItem)
  const isComplete = !!workItem.jobType && !!workItem.labor
  const meta = workItem.jobType ? JOB_TYPE_META[workItem.jobType] : null

  return (
    <div className="border-2 border-[var(--color-ink)] rounded-sm bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          {isComplete ? (
            <CheckCircle2 size={20} className="text-[var(--color-good)] flex-shrink-0" />
          ) : (
            <Circle size={20} className="text-[var(--color-ink)]/25 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-ink)]/40">
              Work Item {index + 1}
            </div>
            <div className="font-display text-xl font-bold leading-tight truncate">
              {meta ? meta.label : 'Choose a job type'}
              {workItem.labor && ` — ${LEVEL_LABELS[workItem.labor.level] ?? workItem.labor.level}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono font-semibold hidden sm:inline">
            {formatCurrency(totals.workItemSubtotal)}
          </span>
          {canRemove && (
            <span
              role="button"
              title="Remove work item"
              onClick={(e) => {
                e.stopPropagation()
                removeWorkItem(workItem.id)
              }}
              className="p-1.5 rounded-sm text-[var(--color-ink)]/40 hover:text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)]"
            >
              <Trash2 size={16} />
            </span>
          )}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-6 pt-1 border-t-2 border-[var(--color-ink)] space-y-6">
          {/* Job type */}
          <section>
            <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/60 mb-2">
              Job Type
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {laborJobTypes().map((jt) => {
                const jtMeta = JOB_TYPE_META[jt] ?? { label: jt, description: '', icon: null }
                const selected = workItem.jobType === jt
                return (
                  <button
                    key={jt}
                    onClick={() => setJobType(workItem.id, jt)}
                    className={`text-left p-3 rounded-sm border-2 transition-colors flex items-center gap-2 ${
                      selected
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-line)] hover:border-[var(--color-ink)]'
                    }`}
                  >
                    <span className={selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]/40'}>
                      {jtMeta.icon}
                    </span>
                    <span className="font-semibold text-sm">{jtMeta.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Equipment */}
          {workItem.jobType && (
            <section>
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/60 mb-2">
                Equipment
              </div>
              <div className="space-y-3">
                {workItem.equipment.length === 0 && (
                  <div className="border-2 border-dashed border-[var(--color-line)] rounded-sm p-6 text-center text-[var(--color-ink)]/50 text-sm">
                    <PackageOpen size={22} className="mx-auto mb-1.5" />
                    No equipment on this work item yet.
                  </div>
                )}
                {workItem.equipment.map((item, idx) => {
                  const canCopy = workItem.equipment
                    .slice(0, idx)
                    .some((e) => e.category === item.category && e.category !== '')
                  return (
                    <EquipmentCard
                      key={item.lineId}
                      workItemId={workItem.id}
                      item={item}
                      canCopy={canCopy}
                      canRemove
                    />
                  )
                })}
                <button
                  onClick={() => addEquipment(workItem.id, blankLineItem())}
                  className="w-full border-2 border-dashed border-[var(--color-line)] rounded-sm py-2.5 flex items-center justify-center gap-2 font-semibold text-sm text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <Plus size={16} /> Add Equipment
                </button>
              </div>
            </section>
          )}

          {/* Labor */}
          {workItem.jobType && (
            <section>
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/60 mb-2">
                Labor
              </div>
              <LaborPicker workItem={workItem} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function LaborPicker({ workItem }: { workItem: WorkItem }) {
  const { setLaborLevel, setLaborHours, customer } = useEstimate()
  if (!workItem.jobType) return null
  const levels = laborLevelsForJobType(workItem.jobType)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {levels.map((rate) => {
          const selected = workItem.labor?.level === rate.level
          return (
            <button
              key={rate.level}
              onClick={() => setLaborLevel(workItem.id, rate.level)}
              className={`text-left p-3 rounded-sm border-2 transition-colors ${
                selected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-line)] hover:border-[var(--color-ink)]'
              }`}
            >
              <div className="font-display text-lg font-bold leading-none mb-1">
                {LEVEL_LABELS[rate.level] ?? rate.level}
              </div>
              <div className="text-xs text-[var(--color-ink)]/60 font-mono">
                {formatCurrency(rate.hourlyRate)}/hr · {rate.estimatedHours.min}–{rate.estimatedHours.max} hrs
              </div>
            </button>
          )
        })}
      </div>

      {workItem.labor && (
        <HoursControl
          workItemId={workItem.id}
          jobType={workItem.jobType}
          level={LEVEL_LABELS[workItem.labor.level] ?? workItem.labor.level}
          hourlyRate={workItem.labor.hourlyRate}
          min={workItem.labor.minHours}
          max={workItem.labor.maxHours}
          value={workItem.labor.selectedHours}
          onChange={(hrs) => setLaborHours(workItem.id, hrs)}
          customerName={customer?.name}
        />
      )}
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
  workItemId: string
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

  const mailtoHref = buildLaborReviewMailto({ customer, jobType, level, requestedHours: rawNum, min, max })

  return (
    <div className="border-2 border-[var(--color-line)] rounded-sm p-4">
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
    </div>
  )
}
