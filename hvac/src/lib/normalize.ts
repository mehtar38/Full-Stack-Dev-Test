import type {
  RawCustomer,
  RawEquipment,
  Customer,
  EquipmentCatalogItem,
  PropertyType,
  InferredSystemComponent,
} from '../types'

// ---------------------------------------------------------------------------
// Customer normalization
// ---------------------------------------------------------------------------

function normalizePropertyType(value: string | undefined): PropertyType {
  const v = (value ?? '').trim().toLowerCase()
  if (v === 'residential') return 'residential'
  if (v === 'commercial') return 'commercial'
  return 'unknown'
}

export function normalizeCustomer(raw: RawCustomer): Customer {
  const propertyType = normalizePropertyType(raw.propertyType ?? raw.property_type)
  const squareFootageRaw = raw.squareFootage ?? raw.sqft
  const squareFootage =
    typeof squareFootageRaw === 'number' && Number.isFinite(squareFootageRaw)
      ? squareFootageRaw
      : null

  return {
    id: raw.id,
    name: raw.name?.trim() || 'Unnamed Customer',
    address: raw.address?.trim() || null,
    phone: raw.phone?.trim() || null,
    propertyType,
    squareFootage,
    systemTypeRaw: raw.systemType?.trim() || null,
    systemAge:
      typeof raw.systemAge === 'number' && Number.isFinite(raw.systemAge)
        ? raw.systemAge
        : null,
    lastServiceDate: raw.lastServiceDate?.trim() || null,
  }
}

// ---------------------------------------------------------------------------
// Equipment catalog normalization
// ---------------------------------------------------------------------------

export function normalizeEquipment(raw: RawEquipment): EquipmentCatalogItem {
  const baseCostRaw = raw.baseCost ?? raw.base_cost
  const baseCost =
    typeof baseCostRaw === 'number' && Number.isFinite(baseCostRaw) ? baseCostRaw : 0

  return {
    id: raw.id,
    name: raw.name?.trim() || 'Unnamed Equipment',
    category: raw.category?.trim() || 'Uncategorized',
    brand: raw.brand?.trim() || 'Unknown',
    modelNumber: raw.modelNumber?.trim() || null,
    baseCost,
  }
}

// ---------------------------------------------------------------------------
// System-type -> equipment-category normalization
//
// customers.json "systemType" strings are free text ("Central AC + Gas
// Furnace", "Rooftop Units (x3)", "Dual Zone - Central AC + Mini-Split").
// This maps that free text onto the canonical category labels used in
// equipment.json, and preserves instance counts like "(x2)".
// ---------------------------------------------------------------------------

const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: 'Air Conditioner', keywords: ['central ac', 'air conditioner', 'a/c'] },
  { category: 'Heat Pump', keywords: ['heat pump'] },
  { category: 'Furnace', keywords: ['gas furnace', 'furnace'] },
  { category: 'Mini-Split', keywords: ['mini-split', 'mini split', 'ductless'] },
  { category: 'Rooftop Unit', keywords: ['rooftop unit', 'rtu'] },
  { category: 'Package Unit', keywords: ['package unit'] },
  { category: 'Air Handler', keywords: ['air handler'] },
  { category: 'Humidifier', keywords: ['humidifier'] },
  { category: 'Air Cleaner', keywords: ['air cleaner'] },
  { category: 'Air Purifier', keywords: ['air purifier'] },
  { category: 'Thermostat', keywords: ['thermostat'] },
  { category: 'Compressor', keywords: ['compressor'] },
]

function toTitleCase(s: string): string {
  return s
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Best-effort match of a free-text segment ("Central AC", "Gas Heaters") to
 * a canonical equipment category. Falls back to a cleaned, title-cased
 * version of the segment itself so the UI has something readable to show
 * even for categories that don't exist in the catalog (e.g. "Gas Heaters").
 */
function matchCategory(segment: string): string {
  const lower = segment.toLowerCase()
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return toTitleCase(segment) || 'Unspecified Equipment'
}

/**
 * Parses a raw systemType string into a flat list of equipment instances.
 * "Mini-Split (x2)" -> two Mini-Split instances.
 * "Central AC + Gas Furnace" -> one Air Conditioner + one Furnace instance.
 */
export function parseSystemType(raw: string | null | undefined): InferredSystemComponent[] {
  if (!raw || !raw.trim()) return []

  const segments = raw
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean)

  const components: InferredSystemComponent[] = []

  for (const segment of segments) {
    const qtyMatch = segment.match(/\(x\s*(\d+)\s*\)/i)
    const count = qtyMatch ? Math.max(1, parseInt(qtyMatch[1], 10)) : 1
    const cleaned = segment
      .replace(/\(x\s*\d+\s*\)/i, '')
      .replace(/^dual\s+zone\s*-\s*/i, '')
      .replace(/^zone\s*-\s*/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim()

    if (!cleaned) continue
    const category = matchCategory(cleaned)

    for (let i = 1; i <= count; i++) {
      components.push({
        category,
        instanceIndex: i,
        instanceCount: count,
        instanceLabel: count > 1 ? `${category} System ${i}` : category,
      })
    }
  }

  return components
}

// ---------------------------------------------------------------------------
// Display fallbacks — never let undefined/null/NaN reach the UI.
// ---------------------------------------------------------------------------

export const NOT_AVAILABLE = 'Not available'

export function displayText(value: string | null | undefined): string {
  const v = value?.trim()
  return v ? v : NOT_AVAILABLE
}

export function displayNumber(value: number | null | undefined, suffix = ''): string {
  if (value === null || value === undefined || Number.isNaN(value)) return NOT_AVAILABLE
  return `${value.toLocaleString()}${suffix}`
}

export function displayPropertyType(propertyType: PropertyType): string {
  if (propertyType === 'unknown') return NOT_AVAILABLE
  return toTitleCase(propertyType)
}

export function formatCurrency(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '$0.00'
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return NOT_AVAILABLE
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return NOT_AVAILABLE
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
