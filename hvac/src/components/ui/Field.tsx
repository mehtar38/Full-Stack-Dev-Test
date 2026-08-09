import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react'

interface WrapperProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FieldWrapper({ label, hint, error, required, children }: WrapperProps) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/70 mb-1.5">
          {label}
          {required && <span className="text-[var(--color-accent)]"> *</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="block text-xs text-[var(--color-ink)]/50 mt-1">{hint}</span>}
      {error && <span className="block text-xs font-semibold text-[var(--color-bad)] mt-1">{error}</span>}
    </label>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function TextInput({ label, hint, error, className = '', ...props }: TextInputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={props.required}>
      <input
        className={`w-full rounded-sm border-2 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-[var(--color-ink)]/35 ${
          error ? 'border-[var(--color-bad)]' : 'border-[var(--color-line)] focus:border-[var(--color-ink)]'
        } ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}

export function SelectInput({ label, hint, error, className = '', children, ...props }: SelectInputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={props.required}>
      <select
        className={`w-full rounded-sm border-2 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors ${
          error ? 'border-[var(--color-bad)]' : 'border-[var(--color-line)] focus:border-[var(--color-ink)]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
