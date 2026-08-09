// ---------------------------------------------------------------------------
// Raw data shapes — these describe the JSON exactly as it exists on disk,
// inconsistencies included. Nothing in the app should read raw JSON directly
// outside of src/lib/normalize.ts.
// ---------------------------------------------------------------------------

export interface RawCustomer {
  id: string
  name: string
  address?: string
  phone?: string
  propertyType?: string
  property_type?: string
  squareFootage?: number
  sqft?: number
  systemType?: string
  systemAge?: number
  lastServiceDate?: string
}

export interface RawEquipment {
  id: string
  name: string
  category: string
  brand: string
  modelNumber?: string
  baseCost?: number
  base_cost?: number
}

// ---------------------------------------------------------------------------
// Normalized domain shapes — everything downstream of normalize.ts works
// with these only.
// ---------------------------------------------------------------------------

export type PropertyType = 'residential' | 'commercial' | 'unknown'

export interface Customer {
  id: string
  name: string
  address: string | null
  phone: string | null
  propertyType: PropertyType
  squareFootage: number | null
  systemTypeRaw: string | null
  systemAge: number | null
  lastServiceDate: string | null
  /** true for customers created in the field, not present in customers.json */
  isNew?: boolean
}

export interface EquipmentCatalogItem {
  id: string
  name: string
  category: string
  brand: string
  modelNumber: string | null
  baseCost: number
}

export interface LaborRate {
  jobType: string
  level: string
  hourlyRate: number
  estimatedHours: { min: number; max: number }
}

// ---------------------------------------------------------------------------
// System-type normalization
// ---------------------------------------------------------------------------

/** One inferred piece of equipment implied by a customer's raw systemType string. */
export interface InferredSystemComponent {
  category: string
  /** e.g. "Mini-Split System 1" of 2 */
  instanceLabel: string
  instanceIndex: number
  instanceCount: number
}

// ---------------------------------------------------------------------------
// Estimate builder — equipment line items
// ---------------------------------------------------------------------------

export type PricingSource = 'catalog' | 'provisional-median' | 'custom' | 'pending-office'

export interface EquipmentLineItem {
  /** stable client-side id for React keys / editing, not a catalog id */
  lineId: string
  category: string
  instanceLabel: string
  brand: string | null
  model: string | null
  modelNumber: string | null
  catalogId: string | null
  cost: number
  pricingSource: PricingSource
  notes?: string
}

// ---------------------------------------------------------------------------
// Estimate builder — labor
// ---------------------------------------------------------------------------

export interface LaborSelection {
  jobType: string
  level: string
  hourlyRate: number
  minHours: number
  maxHours: number
  selectedHours: number
}

// ---------------------------------------------------------------------------
// Work item — one unit of work during a visit (its own job type, equipment,
// and labor). A visit/estimate can contain several, e.g. a diagnostic on
// one system and a repair on another.
// ---------------------------------------------------------------------------

export interface WorkItem {
  id: string
  jobType: string | null
  equipment: EquipmentLineItem[]
  labor: LaborSelection | null
}

// ---------------------------------------------------------------------------
// Central estimate object — single source of truth consumed by the
// technician UI, the customer view, and the PDF generator alike.
// ---------------------------------------------------------------------------

export interface Estimate {
  id: string
  createdAt: string
  customer: Customer
  workItems: WorkItem[]
  discount: number
}

export interface EstimateTotals {
  equipmentSubtotal: number
  laborSubtotal: number
  subtotal: number
  discount: number
  total: number
  hasProvisionalPricing: boolean
}
