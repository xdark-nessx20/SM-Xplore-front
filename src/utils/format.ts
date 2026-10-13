/** Une clases CSS ignorando los valores falsy. */
export function classNames(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(' ')
}

/** Formatea una fecha como "12 oct 2026" en el locale indicado. */
export function formatDate(value: string | Date, locale = 'es-CO'): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** Formatea una fecha como "octubre 2026". */
export function formatMonthYear(value: string | Date, locale = 'es-CO'): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Formatea una fecha con hora en el locale indicado (`es-CO` por defecto). */
export function formatDateTime(value: string | Date, locale = 'es-CO'): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/** Formatea un precio en pesos colombianos: 120000 → "$ 120.000". */
export function formatCurrency(value: number, locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Duración legible: 240 → "4 h", 45 → "45 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = minutes / 60
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`
}
