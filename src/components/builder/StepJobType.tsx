import { Stethoscope, Hammer, PackagePlus, ShieldCheck, Wind, ArrowRight, ArrowLeft } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { laborJobTypes } from '../../lib/data'
import Button from '../ui/Button'

const JOB_TYPE_META: Record<string, { label: string; description: string; icon: React.ReactNode }> = {
  diagnostic: {
    label: 'Diagnostic',
    description: 'Inspect and identify the issue',
    icon: <Stethoscope size={26} />,
  },
  repair: {
    label: 'Repair',
    description: 'Fix an existing system',
    icon: <Hammer size={26} />,
  },
  install: {
    label: 'Installation',
    description: 'New equipment install',
    icon: <PackagePlus size={26} />,
  },
  maintenance: {
    label: 'Maintenance',
    description: 'Routine service & tune-up',
    icon: <ShieldCheck size={26} />,
  },
  ductwork: {
    label: 'Ductwork',
    description: 'Duct repair or new install',
    icon: <Wind size={26} />,
  },
}

export default function StepJobType() {
  const { jobType, setJobType, goNext, goBack } = useEstimate()
  const jobTypes = laborJobTypes()

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {jobTypes.map((jt) => {
          const meta = JOB_TYPE_META[jt] ?? { label: jt, description: '', icon: null }
          const selected = jobType === jt
          return (
            <button
              key={jt}
              onClick={() => setJobType(jt)}
              className={`text-left p-4 rounded-sm border-2 transition-colors flex items-start gap-3 ${
                selected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                  : 'border-[var(--color-line)] bg-white hover:border-[var(--color-ink)]'
              }`}
            >
              <span className={selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]/50'}>
                {meta.icon}
              </span>
              <span>
                <span className="block font-display text-xl font-bold leading-none mb-1">
                  {meta.label}
                </span>
                <span className="block text-sm text-[var(--color-ink)]/60">{meta.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={goBack} icon={<ArrowLeft size={17} />}>
          Back
        </Button>
        <Button onClick={goNext} disabled={!jobType} icon={<ArrowRight size={17} />}>
          Continue to Equipment
        </Button>
      </div>
    </div>
  )
}
