import { useState } from 'react'
import { Copy, Trash2, Mail, AlertTriangle, ChevronDown } from 'lucide-react'
import type { EquipmentLineItem } from '../../types'
import {
  categoriesInCatalog,
  brandsForCategory,
  modelsForCategoryAndBrand,
  equipmentForCategory,
  medianCostForCategory,
  findEquipmentById,
} from '../../lib/data'
import { formatCurrency } from '../../lib/normalize'
import { validateEquipmentItem } from '../../lib/calc'
import { buildPricingRequestMailto } from '../../lib/mailto'
import { useEstimate } from '../../context/EstimateContext'
import { TextInput, SelectInput } from '../ui/Field'
import { Badge, Card } from '../ui/Primitives'
import Button from '../ui/Button'

export default function EquipmentCard({
  workItemId,
  item,
  canCopy,
  canRemove,
}: {
  workItemId: string
  item: EquipmentLineItem
  canCopy: boolean
  canRemove: boolean
}) {
  const { updateEquipment, removeEquipment, copyEquipment } = useEstimate()
  const [showUnknownPanel, setShowUnknownPanel] = useState(false)
  const [manualMode, setManualMode] = useState(item.pricingSource === 'custom' && !!item.brand && !!item.model)

  const allCategories = categoriesInCatalog()
  const categoryOptions = allCategories.includes(item.category)
    ? allCategories
    : [item.category, ...allCategories]

  const catalogMatches = equipmentForCategory(item.category)
  const hasNoMatches = catalogMatches.length === 0
  const brands = brandsForCategory(item.category)
  const models = item.brand ? modelsForCategoryAndBrand(item.category, item.brand) : []

  function handleCategoryChange(category: string) {
    updateEquipment(workItemId, item.lineId, {
      category,
      instanceLabel: item.instanceLabel.replace(item.category, category) || category,
      brand: null,
      model: null,
      modelNumber: null,
      catalogId: null,
      cost: 0,
      pricingSource: 'custom',
    })
    setShowUnknownPanel(false)
    setManualMode(false)
  }

  function handleBrandChange(brand: string) {
    updateEquipment(workItemId, item.lineId, {
      brand,
      model: null,
      modelNumber: null,
      catalogId: null,
      cost: 0,
      pricingSource: 'custom',
    })
    setManualMode(false)
  }

  function handleModelChange(catalogId: string) {
    const eq = findEquipmentById(catalogId)
    if (!eq) return
    updateEquipment(workItemId, item.lineId, {
      model: eq.name,
      modelNumber: eq.modelNumber,
      catalogId: eq.id,
      cost: eq.baseCost,
      pricingSource: 'catalog',
    })
    setShowUnknownPanel(false)
    setManualMode(false)
  }

  function enterManualMode() {
    updateEquipment(workItemId, item.lineId, {
      catalogId: null,
      pricingSource: 'custom',
      cost: item.cost > 0 ? item.cost : 0,
    })
    setManualMode(true)
    setShowUnknownPanel(false)
  }

  return (
    <Card className="animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <input
            value={item.instanceLabel}
            onChange={(e) => updateEquipment(workItemId, item.lineId, { instanceLabel: e.target.value })}
            className="font-display text-xl font-bold bg-transparent outline-none border-b-2 border-transparent focus:border-[var(--color-line)] w-full"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {canCopy && (
            <button
              title="Copy previous equipment"
              onClick={() => copyEquipment(workItemId, item.lineId)}
              className="p-2 rounded-sm hover:bg-[var(--color-paper)] text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]"
            >
              <Copy size={16} />
            </button>
          )}
          {canRemove && (
            <button
              title="Remove equipment"
              onClick={() => removeEquipment(workItemId, item.lineId)}
              className="p-2 rounded-sm hover:bg-[var(--color-bad-soft)] text-[var(--color-ink)]/60 hover:text-[var(--color-bad)]"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput label="Category" value={item.category} onChange={(e) => handleCategoryChange(e.target.value)} required>
          {!item.category && <option value="">Choose category…</option>}
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectInput>

        {!manualMode && item.category && !hasNoMatches && (
          <div>
            <SelectInput
              label="Brand"
              value={item.brand ?? ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              required
            >
              <option value="">Select brand…</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </SelectInput>
            <button
              type="button"
              onClick={enterManualMode}
              className="mt-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
            >
              Add brand/model manually
            </button>
          </div>
        )}
      </div>

      {item.category && !manualMode && hasNoMatches && (
        <button
          type="button"
          onClick={enterManualMode}
          className="mt-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
        >
          Add brand/model manually
        </button>
      )}

      {manualMode && (
        <div className="mt-4 border-2 border-dashed border-[var(--color-line)] rounded-sm p-4 bg-[var(--color-paper)]">
          <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/60 mb-3">
            Manual equipment
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Brand"
              required
              value={item.brand ?? ''}
              onChange={(e) =>
                updateEquipment(workItemId, item.lineId, {
                  brand: e.target.value,
                  pricingSource: 'custom',
                  catalogId: null,
                })
              }
              placeholder="e.g. Carrier"
            />
            <TextInput
              label="Model"
              required
              value={item.model ?? ''}
              onChange={(e) =>
                updateEquipment(workItemId, item.lineId, {
                  model: e.target.value,
                  pricingSource: 'custom',
                  catalogId: null,
                })
              }
              placeholder="e.g. Comfort 16"
            />
            <TextInput
              label="Model Number"
              required
              value={item.modelNumber ?? ''}
              onChange={(e) =>
                updateEquipment(workItemId, item.lineId, {
                  modelNumber: e.target.value,
                  pricingSource: 'custom',
                  catalogId: null,
                })
              }
              placeholder="Model number"
            />
            <TextInput
              label="Cost"
              type="number"
              min={0}
              step="0.01"
              required
              value={item.cost || ''}
              onChange={(e) =>
                updateEquipment(workItemId, item.lineId, {
                  cost: Number(e.target.value) || 0,
                  pricingSource: 'custom',
                  catalogId: null,
                })
              }
              placeholder="0.00"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setManualMode(false)
              updateEquipment(workItemId, item.lineId, {
                brand: null,
                model: null,
                modelNumber: null,
                catalogId: null,
                cost: 0,
                pricingSource: 'custom',
              })
            }}
            className="mt-3 text-xs font-semibold text-[var(--color-ink)]/50 hover:text-[var(--color-ink)] hover:underline"
          >
            Use catalog instead
          </button>
        </div>
      )}

      {!manualMode && !hasNoMatches && item.brand && (
        <div className="mt-4">
          <SelectInput
            label="Model"
            value={item.catalogId ?? ''}
            onChange={(e) => handleModelChange(e.target.value)}
            required
          >
            <option value="">Select model…</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {formatCurrency(m.baseCost)}
              </option>
            ))}
          </SelectInput>
          <button
            type="button"
            onClick={enterManualMode}
            className="mt-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
          >
            Add brand/model manually
          </button>
        </div>
      )}

      {!manualMode && item.catalogId && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Model Number"
            value={item.modelNumber ?? ''}
            onChange={(e) => updateEquipment(workItemId, item.lineId, { modelNumber: e.target.value })}
          />
          <TextInput
            label="Cost"
            type="number"
            min={0}
            step="0.01"
            value={item.cost}
            onChange={(e) => updateEquipment(workItemId, item.lineId, { cost: Number(e.target.value) || 0 })}
          />
        </div>
      )}

      {item.pricingSource === 'catalog' && (
        <div className="mt-3">
          <Badge tone="good">Catalog pricing</Badge>
        </div>
      )}

      {item.category && (hasNoMatches || (item.brand && !item.catalogId && !manualMode) || showUnknownPanel) && (
        <UnknownEquipmentPanel
          workItemId={workItemId}
          item={item}
          hasNoMatches={hasNoMatches}
          onDone={() => setShowUnknownPanel(false)}
        />
      )}

      {item.category && !hasNoMatches && !showUnknownPanel && !item.catalogId && !manualMode && (
        <button
          onClick={() => setShowUnknownPanel(true)}
          className="mt-3 text-sm font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          <ChevronDown size={14} /> Can't find the right brand or model?
        </button>
      )}

      {!validateEquipmentItem(item).valid && (
        <p className="mt-3 text-xs font-semibold text-[var(--color-bad)]">
          {validateEquipmentItem(item).message}
        </p>
      )}
    </Card>
  )
}

function UnknownEquipmentPanel({
  workItemId,
  item,
  hasNoMatches,
  onDone,
}: {
  workItemId: string
  item: EquipmentLineItem
  hasNoMatches: boolean
  onDone: () => void
}) {
  const { customer, updateEquipment } = useEstimate()
  const [customCost, setCustomCost] = useState(item.cost > 0 ? String(item.cost) : '')
  const median = medianCostForCategory(item.category)

  function useMedian() {
    if (median === null) return
    updateEquipment(workItemId, item.lineId, { cost: median, pricingSource: 'provisional-median' })
    onDone()
  }

  function requestOffice() {
    updateEquipment(workItemId, item.lineId, { pricingSource: 'pending-office', cost: 0 })
    onDone()
  }

  function applyCustom() {
    const n = Number(customCost)
    if (Number.isNaN(n) || n < 0) return
    updateEquipment(workItemId, item.lineId, { cost: n, pricingSource: 'custom' })
    onDone()
  }

  const mailtoHref = buildPricingRequestMailto({
    customer,
    category: item.category,
    brand: item.brand,
    model: item.model,
    modelNumber: item.modelNumber,
  })

  return (
    <div className="mt-4 border-2 border-dashed border-[var(--color-line)] rounded-sm p-4 bg-[var(--color-paper)]">
      <div className="flex items-center gap-1.5 text-sm font-bold mb-3">
        <AlertTriangle size={15} className="text-[var(--color-warn)]" />
        {hasNoMatches
          ? `"${item.category}" isn't in the equipment catalog`
          : 'Brand or model not in catalog'}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 bg-white rounded-sm border border-[var(--color-line)] p-3">
          <div>
            <div className="text-sm font-semibold">Use provisional median pricing</div>
            <div className="text-xs text-[var(--color-ink)]/60">
              {median !== null
                ? `Median for ${item.category}: ${formatCurrency(median)}`
                : 'No catalog data available for this category'}
            </div>
          </div>
          <Button size="sm" variant="secondary" onClick={useMedian} disabled={median === null}>
            Use median
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 bg-white rounded-sm border border-[var(--color-line)] p-3">
          <div>
            <div className="text-sm font-semibold">Request pricing from office</div>
            <div className="text-xs text-[var(--color-ink)]/60">Opens a pre-filled email</div>
          </div>
          <a href={mailtoHref} onClick={requestOffice}>
            <Button size="sm" variant="secondary" icon={<Mail size={14} />}>
              Email office
            </Button>
          </a>
        </div>

        <div className="bg-white rounded-sm border border-[var(--color-line)] p-3">
          <div className="text-sm font-semibold mb-2">Enter custom cost manually</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={customCost}
              onChange={(e) => setCustomCost(e.target.value)}
              placeholder="0.00"
              className="flex-1 rounded-sm border-2 border-[var(--color-line)] px-3 py-2 text-sm outline-none focus:border-[var(--color-ink)]"
            />
            <Button size="sm" onClick={applyCustom} disabled={!customCost}>
              Apply
            </Button>
          </div>
        </div>
      </div>

      {item.pricingSource === 'pending-office' && (
        <div className="mt-3">
          <Badge tone="warn">Pending office pricing — $0 included until office responds</Badge>
        </div>
      )}
    </div>
  )
}
