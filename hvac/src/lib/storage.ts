import type { Customer, Estimate } from '../types'

const KEYS = {
  authed: 'hvac-est.tech-authed',
  newCustomers: 'hvac-est.new-customers',
  draftEstimate: 'hvac-est.draft-estimate',
} as const

export const TECH_PASSCODE = 'hvac'

export function isTechAuthed(): boolean {
  return sessionStorage.getItem(KEYS.authed) === 'true'
}

export function setTechAuthed(value: boolean): void {
  if (value) sessionStorage.setItem(KEYS.authed, 'true')
  else sessionStorage.removeItem(KEYS.authed)
}

export function getLocalCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(KEYS.newCustomers)
    if (!raw) return []
    return JSON.parse(raw) as Customer[]
  } catch {
    return []
  }
}

export function saveLocalCustomer(customer: Customer): void {
  const existing = getLocalCustomers()
  localStorage.setItem(KEYS.newCustomers, JSON.stringify([...existing, customer]))
}

export function saveDraftEstimate(estimate: Estimate): void {
  try {
    localStorage.setItem(KEYS.draftEstimate, JSON.stringify(estimate))
  } catch {
    // storage full or unavailable — non-fatal, the estimate still lives in memory
  }
}

export function loadDraftEstimate(): Estimate | null {
  try {
    const raw = localStorage.getItem(KEYS.draftEstimate)
    return raw ? (JSON.parse(raw) as Estimate) : null
  } catch {
    return null
  }
}

export function clearDraftEstimate(): void {
  localStorage.removeItem(KEYS.draftEstimate)
}
