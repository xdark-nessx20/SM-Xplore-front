/** Une clases CSS ignorando los valores falsy. */
export function classNames(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(' ')
}

/** Formatea una fecha en el locale indicado (`es-CO` por defecto). */
export function formatDate(value: string | Date, locale = 'es-CO'): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

/** Formatea una fecha con hora en el locale indicado (`es-CO` por defecto). */
export function formatDateTime(value: string | Date, locale = 'es-CO'): string {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
