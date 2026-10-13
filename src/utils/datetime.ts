/** Fecha ISO → valor para `<input type="datetime-local">` en hora local. */
export function toDateTimeInput(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

/** Valor de `<input type="datetime-local">` → ISO 8601 con zona. */
export function fromDateTimeInput(value: string): string {
  return new Date(value).toISOString()
}

/** Fecha ISO → valor para `<input type="date">`. */
export function toDateInput(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** Fecha ISO → hora local `HH:mm` para `<input type="time">`. */
export function toTimeInput(value: string): string {
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(11, 16)
}

/** Combina una fecha (`YYYY-MM-DD`) y una hora (`HH:mm`) en ISO 8601. */
export function combineDateAndTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toISOString()
}
