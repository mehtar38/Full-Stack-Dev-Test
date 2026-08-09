import type {
  Estimate,
  EstimateTotals,
  EquipmentLineItem,
  InferredSystemComponent,
  WorkItem,
} from '../types'

let lineIdCounter = 0
export function makeLineId(): string {
  lineIdCounter += 1
  return `line-${Date.now()}-${lineIdCounter}`
}

let workItemIdCounter = 0
export function makeWorkItemId(): string {
  workItemIdCounter += 1
  return `work-${Date.now()}-${workItemIdCounter}`
}

export function emptyLineItemFromComponent(component: InferredSystemComponent): EquipmentLineItem {
  return {
    lineId: makeLineId(),
    category: component.category,
    instanceLabel: component.instanceLabel,
    brand: null,
    model: null,
    modelNumber: null,
    catalogId: null,
    cost: 0,
    pricingSource: 'custom',
  }
}

export function blankLineItem(category = ''): EquipmentLineItem {
  return {
    lineId: makeLineId(),
    category,
    instanceLabel: category || 'Additional Equipment',
    brand: null,
    model: null,
    modelNumber: null,
    catalogId: null,
    cost: 0,
    pricingSource: 'custom',
  }
}

export function blankWorkItem(): WorkItem {
  return {
    id: makeWorkItemId(),
    jobType: null,
    equipment: [],
    labor: null,
  }
}

export function equipmentSubtotal(items: EquipmentLineItem[]): number {
  return items.reduce((sum, item) => sum + (Number.isFinite(item.cost) ? item.cost : 0), 0)
}

export function laborTotal(item: Pick<WorkItem, 'labor'>): number {
  if (!item.labor) return 0
  const { hourlyRate, selectedHours } = item.labor
  if (!Number.isFinite(hourlyRate) || !Number.isFinite(selectedHours)) return 0
  return hourlyRate * selectedHours
}

export interface WorkItemTotals {
  equipmentSubtotal: number
  laborSubtotal: number
  workItemSubtotal: number
}

export function computeWorkItemTotals(item: WorkItem): WorkItemTotals {
  const eq = equipmentSubtotal(item.equipment)
  const labor = laborTotal(item)
  return { equipmentSubtotal: eq, laborSubtotal: labor, workItemSubtotal: eq + labor }
}

export function computeTotals(estimate: Estimate): EstimateTotals {
  const perItem = estimate.workItems.map(computeWorkItemTotals)
  const eqSubtotal = perItem.reduce((s, w) => s + w.equipmentSubtotal, 0)
  const laborSubtotal = perItem.reduce((s, w) => s + w.laborSubtotal, 0)
  const subtotal = eqSubtotal + laborSubtotal
  const discount = Math.min(Math.max(estimate.discount, 0), subtotal)
  const total = subtotal - discount
  const hasProvisionalPricing = estimate.workItems.some((wi) =>
    wi.equipment.some((e) => e.pricingSource === 'provisional-median'),
  )

  return {
    equipmentSubtotal: eqSubtotal,
    laborSubtotal,
    subtotal,
    discount,
    total,
    hasProvisionalPricing,
  }
}

export interface WorkItemSection {
  workItem: WorkItem
  totals: WorkItemTotals
}

/** Groups the estimate into per-work-item sections for the customer-facing
 * view and PDF, each with its own equipment, labor, and subtotal. */
export function buildWorkItemSections(estimate: Estimate): WorkItemSection[] {
  return estimate.workItems.map((workItem) => ({
    workItem,
    totals: computeWorkItemTotals(workItem),
  }))
}

/** Clamp a requested discount into the valid [0, subtotal] range. */
export function clampDiscount(discount: number, subtotal: number): number {
  if (Number.isNaN(discount) || discount < 0) return 0
  if (discount > subtotal) return subtotal
  return discount
}

/** Clamp requested labor hours into the labor rate's allowed range. */
export function clampHours(hours: number, min: number, max: number): number {
  if (Number.isNaN(hours)) return min
  if (hours < min) return min
  if (hours > max) return max
  return hours
}
