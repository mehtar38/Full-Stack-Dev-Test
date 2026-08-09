import jsPDF from 'jspdf'
import type { Estimate, EstimateTotals } from '../types'
import { formatCurrency, formatDate, displayText } from './normalize'
import { buildWorkItemSections } from './calc'

const INK: [number, number, number] = [20, 22, 28]
const ACCENT: [number, number, number] = [255, 90, 31]
const GRAY: [number, number, number] = [120, 120, 120]
const LINE: [number, number, number] = [222, 218, 208]

const JOB_TYPE_LABELS: Record<string, string> = {
  diagnostic: 'Diagnostic',
  repair: 'Repair',
  install: 'Installation',
  maintenance: 'Maintenance',
  ductwork: 'Ductwork',
}

const LEVEL_LABELS: Record<string, string> = {
  standard: 'Standard',
  complex: 'Complex',
  minor: 'Minor',
  major: 'Major',
  residential: 'Residential',
  commercial: 'Commercial',
  'mini-split': 'Mini-Split',
  comprehensive: 'Comprehensive',
  repair: 'Repair',
  'new-install': 'New Install',
}

export function generateEstimatePdf(estimate: Estimate, totals: EstimateTotals): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  const contentWidth = pageWidth - margin * 2
  let y = 0

  // Letterhead band
  doc.setFillColor(...INK)
  doc.rect(0, 0, pageWidth, 84, 'F')
  doc.setFillColor(...ACCENT)
  doc.rect(margin, 24, 34, 34, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('SUMMIT AIR', margin + 44, 42)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(210, 210, 210)
  doc.text('HEATING & COOLING CO.', margin + 44, 55)
  doc.setFontSize(8.5)
  doc.text('2140 Industrial Pkwy, Springfield, IL', pageWidth - margin, 36, { align: 'right' })
  doc.text('(217) 555-0100  ·  office@summitair.example', pageWidth - margin, 48, { align: 'right' })

  y = 116

  // Prepared for / date row
  doc.setTextColor(...GRAY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('PREPARED FOR', margin, y)
  doc.text('ESTIMATE DATE', pageWidth - margin, y, { align: 'right' })

  y += 16
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(estimate.customer.name || 'Customer', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(formatDate(estimate.createdAt), pageWidth - margin, y, { align: 'right' })

  y += 16
  doc.setFontSize(9.5)
  doc.setTextColor(...GRAY)
  doc.text(displayText(estimate.customer.address), margin, y)
  doc.setFont('courier', 'normal')
  doc.setFontSize(8.5)
  doc.text(estimate.id, pageWidth - margin, y, { align: 'right' })

  y += 18
  doc.setDrawColor(...LINE)
  doc.setLineWidth(1)
  doc.line(margin, y, pageWidth - margin, y)
  y += 24

  const sections = buildWorkItemSections(estimate)
  const multipleWorkItems = sections.length > 1

  function ensureSpace(needed: number) {
    if (y + needed > 700) {
      doc.addPage()
      y = 48
    }
  }

  sections.forEach((section, i) => {
    const wi = section.workItem
    const jobLabel = wi.jobType ? JOB_TYPE_LABELS[wi.jobType] ?? wi.jobType : 'Service'

    ensureSpace(28)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...ACCENT)
    doc.text(
      (multipleWorkItems ? `WORK ITEM ${i + 1} — ${jobLabel}` : `${jobLabel} SERVICE`).toUpperCase(),
      margin,
      y,
    )
    y += 16

    wi.equipment.forEach((item) => {
      ensureSpace(30)
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...INK)
      doc.text(item.model ?? item.instanceLabel, margin, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(formatCurrency(item.cost), pageWidth - margin, y, { align: 'right' })
      y += 13
      doc.setFontSize(8.5)
      doc.setTextColor(...GRAY)
      let subtext = displayText(item.brand)
      if (item.pricingSource === 'provisional-median') subtext += '   •   PROVISIONAL PRICING'
      if (item.pricingSource === 'pending-office') subtext += '   •   PENDING OFFICE PRICING'
      doc.text(subtext, margin, y)
      y += 14
      doc.setDrawColor(...LINE)
      doc.setLineDashPattern([2, 2], 0)
      doc.line(margin, y - 6, pageWidth - margin, y - 6)
      doc.setLineDashPattern([], 0)
      y += 6
    })

    if (wi.labor) {
      ensureSpace(30)
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...INK)
      const levelLabel = LEVEL_LABELS[wi.labor.level] ?? wi.labor.level
      doc.text(`Labor — ${jobLabel} (${levelLabel})`, margin, y)
      doc.setFont('helvetica', 'normal')
      doc.text(formatCurrency(section.totals.laborSubtotal), pageWidth - margin, y, { align: 'right' })
      y += 13
      doc.setFontSize(8.5)
      doc.setTextColor(...GRAY)
      doc.text(`${wi.labor.selectedHours} hrs @ ${formatCurrency(wi.labor.hourlyRate)}/hr`, margin, y)
      y += 14
    }

    ensureSpace(20)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GRAY)
    doc.text('Work item subtotal', margin, y)
    doc.text(formatCurrency(section.totals.workItemSubtotal), pageWidth - margin, y, { align: 'right' })
    y += 22
  })

  // Totals block
  ensureSpace(120)
  doc.setDrawColor(...INK)
  doc.setLineWidth(1.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 20

  const totalRow = (label: string, value: string, opts?: { bold?: boolean; accent?: boolean }) => {
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal')
    doc.setFontSize(opts?.bold ? 11 : 10)
    doc.setTextColor(...(opts?.accent ? ACCENT : opts?.bold ? INK : GRAY))
    doc.text(label, margin, y)
    doc.text(value, pageWidth - margin, y, { align: 'right' })
    y += opts?.bold ? 18 : 15
  }

  totalRow('Combined Subtotal', formatCurrency(totals.subtotal))
  if (totals.discount > 0) totalRow('Discount', `-${formatCurrency(totals.discount)}`, { accent: true })
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(...INK)
  doc.text('ESTIMATED TOTAL', margin, y)
  doc.setFontSize(17)
  doc.text(formatCurrency(totals.total), pageWidth - margin, y, { align: 'right' })

  y += 34
  ensureSpace(60)
  doc.setDrawColor(...LINE)
  doc.setLineWidth(1)
  doc.line(margin, y, pageWidth - margin, y)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  let disclaimer =
    'This is an estimate, not a final invoice. Final pricing may vary based on conditions found during service. Estimate valid for 30 days from the date above.'
  if (totals.hasProvisionalPricing) {
    disclaimer +=
      ' Items marked "provisional pricing" use a category median in place of a confirmed catalog price and are subject to change.'
  }
  const wrapped = doc.splitTextToSize(disclaimer, contentWidth)
  doc.text(wrapped, margin, y)

  const fileName = `Estimate_${estimate.customer.name.replace(/\s+/g, '_') || 'Customer'}_${estimate.id}.pdf`
  doc.save(fileName)
}
