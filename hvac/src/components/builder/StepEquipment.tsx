import { Plus, ArrowRight, ArrowLeft, PackageOpen } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import EquipmentCard from './EquipmentCard'
import Button from '../ui/Button'
import { blankLineItem } from '../../lib/calc'

export default function StepEquipment() {
  const { equipment, addEquipment, goNext, goBack } = useEstimate()

  return (
    <div className="space-y-4">
      {equipment.length === 0 && (
        <div className="border-2 border-dashed border-[var(--color-line)] rounded-sm p-8 text-center text-[var(--color-ink)]/50">
          <PackageOpen size={28} className="mx-auto mb-2" />
          No equipment on this estimate yet.
        </div>
      )}

      {equipment.map((item, idx) => {
        const canCopy = equipment
          .slice(0, idx)
          .some((e) => e.category === item.category && e.category !== '')
        return <EquipmentCard key={item.lineId} item={item} canCopy={canCopy} canRemove />
      })}

      <button
        onClick={() => addEquipment(blankLineItem())}
        className="w-full border-2 border-dashed border-[var(--color-line)] rounded-sm py-3.5 flex items-center justify-center gap-2 font-semibold text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
      >
        <Plus size={18} /> Add Equipment
      </button>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={goBack} icon={<ArrowLeft size={17} />}>
          Back
        </Button>
        <Button onClick={goNext} icon={<ArrowRight size={17} />}>
          Continue to Labor
        </Button>
      </div>
    </div>
  )
}
