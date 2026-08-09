import type { Customer, Estimate } from '../types'

const KEYS = {
  authed: 'hvac-est.tech-authed',
  newCustomers: 'hvac-est.new-customers',
  draftEstimate: 'hvac-est.draft-estimate',
} as const

// ---------------------------------------------------------------------------
// Tech session
//
// This is a lightweight, single-shared-passcode gate appropriate for an
// internal field tool prototype — not a real auth system. No username,
// no backend, no per-user accounts, per the spec.
// ---------------------------------------------------------------------------

export const TECH_PASSCODE = 'HVAC2026'

export function isTechAuthed(): boolean {
  return sessionStorage.getItem(KEYS.authed) === 'true'
}

export function setTechAuthed(value: boolean): void {
  if (value) sessionStorage.setItem(KEYS.authed, 'true')
  else sessionStorage.removeItem(KEYS.authed)
}

// ---------------------------------------------------------------------------
// New customers created in the field
//
// Per spec these don't need to persist to a central database — localStorage
// is enough so a tech's entry survives a page refresh mid-estimate.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Draft estimate — survives accidental reloads mid-workflow
// ---------------------------------------------------------------------------

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
