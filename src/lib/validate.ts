export function isRequired(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0
}

export function isValidPhone(value: string): boolean {
  if (!value) return false
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 
}