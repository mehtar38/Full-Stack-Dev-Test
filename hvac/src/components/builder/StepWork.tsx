import { Plus, ArrowRight, ArrowLeft } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import WorkItemPanel from './WorkItemPanel'
import Button from '../ui/Button'

export default function StepWork() {
  const { workItems, addWorkItem, goNext, goBack } = useEstimate()
  const allComplete = workItems.length > 0 && workItems.every((w) => !!w.jobType && !!w.labor)

  return (
    <div className="space-y-4">
      {workItems.map((wi, idx) => (
        <WorkItemPanel key={wi.id} workItem={wi} index={idx} canRemove={workItems.length > 1} />
      ))}

      <button
        onClick={addWorkItem}
        className="w-full border-2 border-dashed border-[var(--color-line)] rounded-sm py-3.5 flex items-center justify-center gap-2 font-semibold text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
      >
        <Plus size={18} /> Add Another Work Item
      </button>

      {!allComplete && (
        <p className="text-xs text-[var(--color-ink)]/50">
          Each work item needs a job type and a labor selection before you can continue.
        </p>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={goBack} icon={<ArrowLeft size={17} />}>
          Back
        </Button>
        <Button onClick={goNext} disabled={!allComplete} icon={<ArrowRight size={17} />}>
          Continue to Discount
        </Button>
      </div>
    </div>
  )
}
