import { useMemo, useState } from 'react'
import { Search, Plus, MapPin, Phone, Building2, Home, ArrowRight, X } from 'lucide-react'
import { useEstimate } from '../../context/EstimateContext'
import { CUSTOMERS, filterCustomers } from '../../lib/data'
import { getLocalCustomers, saveLocalCustomer } from '../../lib/storage'
import {
  displayText,
  displayNumber,
  displayPropertyType,
  formatDate,
  NOT_AVAILABLE,
} from '../../lib/normalize'
import type { Customer, PropertyType } from '../../types'
import Button from '../ui/Button'
import { TextInput, SelectInput } from '../ui/Field'
import { Card } from '../ui/Primitives'

export default function StepCustomer() {
  const { customer, setCustomer, goNext } = useEstimate()
  const [query, setQuery] = useState('')
  const [showAddNew, setShowAddNew] = useState(false)
  const [localVersion, setLocalVersion] = useState(0)

  const pool = useMemo(() => {
    void localVersion
    return [...CUSTOMERS, ...getLocalCustomers()]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localVersion])

  const results = useMemo(() => filterCustomers(pool, query), [pool, query])

  function handleSelect(c: Customer) {
    setCustomer(c)
    setQuery('')
  }

  function handleCreated(c: Customer) {
    saveLocalCustomer(c)
    setLocalVersion((v) => v + 1)
    setCustomer(c)
    setShowAddNew(false)
    setQuery('')
  }

  if (showAddNew) {
    return <NewCustomerForm onCancel={() => setShowAddNew(false)} onCreated={handleCreated} />
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1.5">
          Customer Name
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink)]/40"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Start typing a customer name or address…"
            className="w-full rounded-sm border-2 border-[var(--color-line)] bg-white pl-11 pr-4 py-3 text-[15px] outline-none focus:border-[var(--color-ink)] transition-colors"
          />
        </div>

        {query.trim() && (
          <div className="mt-2 border-2 border-[var(--color-ink)] rounded-sm bg-white overflow-hidden">
            {results.length > 0 ? (
              results.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="w-full text-left px-4 py-3 border-b border-[var(--color-line)] last:border-b-0 hover:bg-[var(--color-paper)] transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-sm text-[var(--color-ink)]/60">
                      {displayText(c.address)}
                    </div>
                  </div>
                  {c.propertyType === 'commercial' ? (
                    <Building2 size={16} className="text-[var(--color-ink)]/40 flex-shrink-0" />
                  ) : (
                    <Home size={16} className="text-[var(--color-ink)]/40 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-[var(--color-ink)]/60">
                No matching customer found.
              </div>
            )}
            <button
              onClick={() => setShowAddNew(true)}
              className="w-full text-left px-4 py-3 flex items-center gap-2 font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] transition-colors"
            >
              <Plus size={16} /> Add New Customer
            </button>
          </div>
        )}
      </div>

      {!query.trim() && !customer && (
        <button
          onClick={() => setShowAddNew(true)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
        >
          <Plus size={16} /> Add a new customer instead
        </button>
      )}

      {customer && (
        <Card className="animate-slide-up">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-good)] mb-1">
                Customer selected
              </div>
              <div className="font-display text-2xl font-bold leading-none">{customer.name}</div>
            </div>
            {customer.propertyType === 'commercial' ? (
              <Building2 size={22} className="text-[var(--color-ink)]/30" />
            ) : (
              <Home size={22} className="text-[var(--color-ink)]/30" />
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Detail icon={<MapPin size={14} />} label="Address" value={displayText(customer.address)} />
            <Detail icon={<Phone size={14} />} label="Phone" value={displayText(customer.phone)} />
            <Detail label="Property Type" value={displayPropertyType(customer.propertyType)} />
            <Detail label="Square Footage" value={displayNumber(customer.squareFootage, ' sq ft')} />
            <Detail label="System Type" value={displayText(customer.systemTypeRaw)} />
            <Detail
              label="System Age"
              value={customer.systemAge !== null ? `${customer.systemAge} yrs (reference only)` : NOT_AVAILABLE}
            />
            <Detail
              label="Last Service"
              value={`${formatDate(customer.lastServiceDate)} (reference only)`}
            />
          </dl>

          <div className="mt-5 flex justify-end">
            <Button onClick={goNext} icon={<ArrowRight size={17} />}>
              Continue to Job Type
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function Detail({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink)]/50">
        {icon}
        {label}
      </dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function NewCustomerForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: (c: Customer) => void
}) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyType, setPropertyType] = useState<PropertyType>('residential')
  const [squareFootage, setSquareFootage] = useState('')
  const [systemType, setSystemType] = useState('')

  const squareFootageNumber = Number(squareFootage)
  const formValid =
    !!name.trim() &&
    !!address.trim() &&
    !!phone.trim() &&
    !!systemType.trim() &&
    !!squareFootage &&
    Number.isFinite(squareFootageNumber) &&
    squareFootageNumber > 0

  function submit() {
    if (!formValid) return
    const c: Customer = {
      id: `LOCAL-${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      propertyType,
      squareFootage: squareFootageNumber,
      systemTypeRaw: systemType.trim(),
      systemAge: null,
      lastServiceDate: null,
      isNew: true,
    }
    onCreated(c)
  }

  return (
    <Card className="animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="font-display text-2xl font-bold">New Customer</div>
        <button onClick={onCancel} className="text-[var(--color-ink)]/50 hover:text-[var(--color-ink)]">
          <X size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <TextInput
            label="Customer Name"
            required
            error={!name.trim() ? 'Customer name is required.' : undefined}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="sm:col-span-2">
          <TextInput
            label="Address"
            required
            error={!address.trim() ? 'Address is required.' : undefined}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, ST 00000"
          />
        </div>
        <TextInput
          label="Phone"
          required
          error={!phone.trim() ? 'Phone is required.' : undefined}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
        />
        <SelectInput
          label="Property Type"
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value as PropertyType)}
        >
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </SelectInput>
        <TextInput
          label="Square Footage"
          type="number"
          min={1}
          required
          error={squareFootage && (!Number.isFinite(squareFootageNumber) || squareFootageNumber <= 0) ? 'Enter a valid square footage.' : !squareFootage ? 'Square footage is required.' : undefined}
          value={squareFootage}
          onChange={(e) => setSquareFootage(e.target.value)}
          placeholder="2000"
        />
        <TextInput
          label="System Type"
          required
          error={!systemType.trim() ? 'System type is required.' : undefined}
          value={systemType}
          onChange={(e) => setSystemType(e.target.value)}
          placeholder="e.g. Central AC + Gas Furnace"
          hint="Used to suggest equipment in the next steps"
        />
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={!formValid} icon={<ArrowRight size={17} />}>
          Save & Continue
        </Button>
      </div>
    </Card>
  )
}
