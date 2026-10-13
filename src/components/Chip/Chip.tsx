import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '@/utils/format'
import styles from './Chip.module.css'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Chip activo: fondo navy y texto blanco. */
  selected?: boolean
  /** Contorno teal cuando no está seleccionado (filtros del catálogo). */
  accent?: boolean
}

/** Filtro o etiqueta pulsable. */
export function Chip({
  selected = false,
  accent = false,
  className,
  type = 'button',
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={classNames(
        styles.chip,
        selected && styles.selected,
        !selected && accent && styles.accent,
        className,
      )}
      {...props}
    />
  )
}
