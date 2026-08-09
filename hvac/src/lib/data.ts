import rawCustomers from '../data/customers.json'
import rawEquipment from '../data/equipment.json'
import rawLaborRates from '../data/labor_rates.json'
import type { RawCustomer, RawEquipment, LaborRate, Customer, EquipmentCatalogItem } from '../types'
import { normalizeCustomer, normalizeEquipment } from './normalize'

export const CUSTOMERS: Customer[] = (rawCustomers as RawCustomer[]).map(normalizeCustomer)
export const EQUIPMENT_CATALOG: EquipmentCatalogItem[] = (rawEquipment as RawEquipment[]).map(
  normalizeEquipment,
)
export const LABOR_RATES: LaborRate[] = rawLaborRates as LaborRate[]

// ---------------------------------------------------------------------------
// Equipment catalog queries
// ---------------------------------------------------------------------------

export function categoriesInCatalog(): string[] {
  return Array.from(new Set(EQUIPMENT_CATALOG.map((e) => e.category))).sort()
}

export function equipmentForCategory(category: string): EquipmentCatalogItem[] {
  return EQUIPMENT_CATALOG.filter((e) => e.category === category)
}

export function brandsForCategory(category: string): string[] {
  return Array.from(new Set(equipmentForCategory(category).map((e) => e.brand))).sort()
}

export function modelsForCategoryAndBrand(
  category: string,
  brand: string,
): EquipmentCatalogItem[] {
  return equipmentForCategory(category).filter((e) => e.brand === brand)
}

export function findEquipmentById(id: string): EquipmentCatalogItem | undefined {
  return EQUIPMENT_CATALOG.find((e) => e.id === id)
}

/** Median catalog cost for a category, used as provisional pricing when a
 * technician can't find the exact equipment/brand in the catalog. */
export function medianCostForCategory(category: string): number | null {
  const costs = equipmentForCategory(category)
    .map((e) => e.baseCost)
    .filter((c) => typeof c === 'number' && c > 0)
    .sort((a, b) => a - b)

  if (costs.length === 0) return null
  const mid = Math.floor(costs.length / 2)
  return costs.length % 2 !== 0 ? costs[mid] : (costs[mid - 1] + costs[mid]) / 2
}

// ---------------------------------------------------------------------------
// Labor queries
// ---------------------------------------------------------------------------

export function laborJobTypes(): string[] {
  return Array.from(new Set(LABOR_RATES.map((r) => r.jobType)))
}

export function laborLevelsForJobType(jobType: string): LaborRate[] {
  return LABOR_RATES.filter((r) => r.jobType === jobType)
}

export function findLaborRate(jobType: string, level: string): LaborRate | undefined {
  return LABOR_RATES.find((r) => r.jobType === jobType && r.level === level)
}

// ---------------------------------------------------------------------------
// Customer queries
// ---------------------------------------------------------------------------

export function filterCustomers(list: Customer[], query: string): Customer[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return list
    .filter((c) => c.name.toLowerCase().includes(q) || c.address?.toLowerCase().includes(q))
    .slice(0, 8)
}

export function searchCustomers(query: string): Customer[] {
  return filterCustomers(CUSTOMERS, query)
}
