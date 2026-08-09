import type { Customer } from './../types'

export function buildPricingRequestMailto(params: {
  customer: Customer | null
  category: string
  brand?: string | null
  model?: string | null
  modelNumber?: string | null
}): string {
  const { customer, category, brand, model, modelNumber } = params
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subject = `Pricing Request: ${category}${brand ? ` — ${brand}` : ''}`

  const lines = [
    `Date: ${today}`,
    `Customer: ${customer?.name ?? 'Not yet selected'}`,
    customer?.address ? `Address: ${customer.address}` : null,
    `Equipment category: ${category}`,
    brand ? `Brand: ${brand}` : 'Brand: Not specified',
    model ? `Model: ${model}` : null,
    modelNumber ? `Model number: ${modelNumber}` : null,
    '',
    'Requested: current pricing for the equipment above. This item is not in the catalog.',
    '',
    '— Sent from the field via the estimate builder',
  ].filter((l): l is string => l !== null)

  const body = lines.join('\n')

  return `mailto:support@va.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export function buildLaborReviewMailto(params: {
  customer: Customer | null
  jobType: string
  level: string
  requestedHours: number
  min: number
  max: number
}): string {
  const { customer, jobType, level, requestedHours, min, max } = params
  const subject = `Labor Hours Review: ${jobType} / ${level}`
  const body = [
    `Customer: ${customer?.name ?? 'Not yet selected'}`,
    `Job type: ${jobType} — ${level}`,
    `Standard allowed range: ${min}–${max} hrs`,
    `Requested hours: ${requestedHours}`,
    '',
    'Requesting approval for hours outside the standard estimated range.',
    '',
    '— Sent from the field via the estimate builder',
  ].join('\n')
  return `mailto:office@office.example?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
