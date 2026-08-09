import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Customer, EquipmentLineItem, Estimate, EstimateTotals, WorkItem } from '../types'
import { computeTotals, clampDiscount, clampHours, makeLineId, blankLineItem, blankWorkItem } from '../lib/calc'
import { parseSystemType } from '../lib/normalize'
import { findLaborRate } from '../lib/data'

export type WizardStep = 'customer' | 'work' | 'discount' | 'review' | 'customer-view'

const STEP_ORDER: WizardStep[] = ['customer', 'work', 'discount', 'review', 'customer-view']

interface EstimateContextValue {
  step: WizardStep
  goToStep: (step: WizardStep) => void
  goNext: () => void
  goBack: () => void
  canAccessStep: (step: WizardStep) => boolean

  customer: Customer | null
  setCustomer: (customer: Customer) => void
  technicianName: string
  setTechnicianName: (name: string) => void

  workItems: WorkItem[]
  addWorkItem: () => void
  removeWorkItem: (id: string) => void
  /** id of the work item that should render expanded / scrolled-to when the Work step mounts */
  focusWorkItemId: string | null
  focusWorkItem: (id: string) => void

  setJobType: (workItemId: string, jobType: string) => void

  addEquipment: (workItemId: string, item?: EquipmentLineItem) => void
  updateEquipment: (workItemId: string, lineId: string, patch: Partial<EquipmentLineItem>) => void
  removeEquipment: (workItemId: string, lineId: string) => void
  copyEquipment: (workItemId: string, lineId: string) => void

  setLaborLevel: (workItemId: string, level: string) => void
  setLaborHours: (workItemId: string, hours: number) => void

  discount: number
  setDiscount: (amount: number) => void

  reviewApproved: boolean
  approveReview: () => void

  estimate: Estimate
  totals: EstimateTotals

  resetEstimate: () => void
}

const EstimateContext = createContext<EstimateContextValue | null>(null)

function newEstimateId(): string {
  return `EST-${Date.now().toString(36).toUpperCase()}`
}

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WizardStep>('customer')
  const [customer, setCustomerState] = useState<Customer | null>(null)
  const [technicianName, setTechnicianName] = useState('')
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [focusWorkItemId, setFocusWorkItemId] = useState<string | null>(null)
  const [discount, setDiscountState] = useState(0)
  const [reviewApproved, setReviewApproved] = useState(false)

  const idRef = useRef(newEstimateId())
  const createdAtRef = useRef(new Date().toISOString())

  function updateWorkItem(id: string, patch: (w: WorkItem) => WorkItem) {
    setWorkItems((prev) => prev.map((w) => (w.id === id ? patch(w) : w)))
  }

  const addWorkItem = useCallback(() => {
    const wi = blankWorkItem()
    setWorkItems((prev) => [...prev, wi])
    setFocusWorkItemId(wi.id)
  }, [])

  const removeWorkItem = useCallback((id: string) => {
    setWorkItems((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const focusWorkItem = useCallback(
    (id: string) => {
      setFocusWorkItemId(id)
      setStep('work')
    },
    [],
  )

  // ---- navigation -------------------------------------------------

  const canAccessStep = useCallback(
    (target: WizardStep): boolean => {
      const hasCompleteWorkItem = workItems.some((w) => !!w.jobType && !!w.labor)
      switch (target) {
        case 'customer':
          return true
        case 'work':
          return !!customer
        case 'discount':
          return !!customer && hasCompleteWorkItem
        case 'review':
          return !!customer && hasCompleteWorkItem
        case 'customer-view':
          return reviewApproved
        default:
          return false
      }
    },
    [customer, workItems, reviewApproved],
  )

  const goToStep = useCallback(
    (target: WizardStep) => {
      if (canAccessStep(target)) setStep(target)
    },
    [canAccessStep],
  )

  const goNext = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step)
    const next = STEP_ORDER[idx + 1]
    if (next && canAccessStep(next)) setStep(next)
  }, [step, canAccessStep])

  const goBack = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step)
    const prev = STEP_ORDER[idx - 1]
    if (prev) setStep(prev)
  }, [step])

  // ---- customer -------------------------------------------------

  const setCustomer = useCallback((c: Customer) => {
    setCustomerState(c)
    const components = parseSystemType(c.systemTypeRaw)
    const firstWorkItem: WorkItem = {
      ...blankWorkItem(),
      equipment: components.map((component) => ({
        lineId: makeLineId(),
        category: component.category,
        instanceLabel: component.instanceLabel,
        brand: null,
        model: null,
        modelNumber: null,
        catalogId: null,
        cost: 0,
        pricingSource: 'custom' as const,
      })),
    }
    setWorkItems([firstWorkItem])
    setFocusWorkItemId(firstWorkItem.id)
    setDiscountState(0)
    setReviewApproved(false)
  }, [])

  // ---- job type -------------------------------------------------

  const setJobType = useCallback((workItemId: string, jt: string) => {
    updateWorkItem(workItemId, (w) => ({ ...w, jobType: jt, labor: null }))
  }, [])

  // ---- equipment -------------------------------------------------

  const addEquipment = useCallback((workItemId: string, item?: EquipmentLineItem) => {
    updateWorkItem(workItemId, (w) => ({ ...w, equipment: [...w.equipment, item ?? blankLineItem()] }))
  }, [])

  const updateEquipment = useCallback(
    (workItemId: string, lineId: string, patch: Partial<EquipmentLineItem>) => {
      updateWorkItem(workItemId, (w) => ({
        ...w,
        equipment: w.equipment.map((e) => (e.lineId === lineId ? { ...e, ...patch } : e)),
      }))
    },
    [],
  )

  const removeEquipment = useCallback((workItemId: string, lineId: string) => {
    updateWorkItem(workItemId, (w) => ({ ...w, equipment: w.equipment.filter((e) => e.lineId !== lineId) }))
  }, [])

  const copyEquipment = useCallback((workItemId: string, lineId: string) => {
    updateWorkItem(workItemId, (w) => {
      const targetIdx = w.equipment.findIndex((e) => e.lineId === lineId)
      if (targetIdx === -1) return w
      const target = w.equipment[targetIdx]
      const source = [...w.equipment]
        .slice(0, targetIdx)
        .reverse()
        .find((e) => e.category === target.category)
      if (!source) return w
      const nextEquipment = [...w.equipment]
      nextEquipment[targetIdx] = {
        ...target,
        brand: source.brand,
        model: source.model,
        modelNumber: source.modelNumber,
        catalogId: source.catalogId,
        cost: source.cost,
        pricingSource: source.pricingSource,
      }
      return { ...w, equipment: nextEquipment }
    })
  }, [])

  // ---- labor -------------------------------------------------

  const setLaborLevel = useCallback((workItemId: string, level: string) => {
    updateWorkItem(workItemId, (w) => {
      if (!w.jobType) return w
      const rate = findLaborRate(w.jobType, level)
      if (!rate) return w
      return {
        ...w,
        labor: {
          jobType: w.jobType,
          level,
          hourlyRate: rate.hourlyRate,
          minHours: rate.estimatedHours.min,
          maxHours: rate.estimatedHours.max,
          selectedHours: rate.estimatedHours.min,
        },
      }
    })
  }, [])

  const setLaborHours = useCallback((workItemId: string, hours: number) => {
    updateWorkItem(workItemId, (w) =>
      w.labor
        ? { ...w, labor: { ...w.labor, selectedHours: clampHours(hours, w.labor.minHours, w.labor.maxHours) } }
        : w,
    )
  }, [])

  // ---- discount (whole-estimate) -------------------------------------------------

  const setDiscount = useCallback(
    (amount: number) => {
      const combinedSubtotal = workItems.reduce((sum, w) => {
        const eq = w.equipment.reduce((s, e) => s + (Number.isFinite(e.cost) ? e.cost : 0), 0)
        const labor = w.labor ? w.labor.hourlyRate * w.labor.selectedHours : 0
        return sum + eq + labor
      }, 0)
      setDiscountState(clampDiscount(amount, combinedSubtotal))
    },
    [workItems],
  )

  const approveReview = useCallback(() => setReviewApproved(true), [])

  const resetEstimate = useCallback(() => {
    idRef.current = newEstimateId()
    createdAtRef.current = new Date().toISOString()
    setCustomerState(null)
    setTechnicianName('')
    setWorkItems([])
    setFocusWorkItemId(null)
    setDiscountState(0)
    setReviewApproved(false)
    setStep('customer')
  }, [])

  const estimate: Estimate = useMemo(
    () => ({
      id: idRef.current,
      createdAt: createdAtRef.current,
      technicianName,
      customer: customer ?? {
        id: '',
        name: '',
        address: null,
        phone: null,
        propertyType: 'unknown',
        squareFootage: null,
        systemTypeRaw: null,
        systemAge: null,
        lastServiceDate: null,
      },
      workItems,
      discount,
    }),
    [customer, technicianName, workItems, discount],
  )

  const totals = useMemo(() => computeTotals(estimate), [estimate])

  const value: EstimateContextValue = {
    step,
    goToStep,
    goNext,
    goBack,
    canAccessStep,
    customer,
    setCustomer,
    technicianName,
    setTechnicianName,
    workItems,
    addWorkItem,
    removeWorkItem,
    focusWorkItemId,
    focusWorkItem,
    setJobType,
    addEquipment,
    updateEquipment,
    removeEquipment,
    copyEquipment,
    setLaborLevel,
    setLaborHours,
    discount,
    setDiscount,
    reviewApproved,
    approveReview,
    estimate,
    totals,
    resetEstimate,
  }

  return <EstimateContext.Provider value={value}>{children}</EstimateContext.Provider>
}

export function useEstimate(): EstimateContextValue {
  const ctx = useContext(EstimateContext)
  if (!ctx) throw new Error('useEstimate must be used within EstimateProvider')
  return ctx
}
