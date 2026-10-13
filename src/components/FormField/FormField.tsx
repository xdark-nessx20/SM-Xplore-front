import { useId } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'
import styles from './FormField.module.css'

interface SelectOption {
  value: string
  label: string
}

export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  id?: string
  /** Contenido al final del campo (p. ej. "Mostrar" en la contraseña). */
  trailing?: ReactNode
}

/** Campo de texto con etiqueta asociada automáticamente. */
export function Field({ label, hint, id, trailing, ...input }: FieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <input className={styles.control} id={fieldId} {...input} />
        {trailing !== undefined && (
          <span className={styles.trailing}>{trailing}</span>
        )}
      </div>
      {hint !== undefined && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string
  hint?: string
  id?: string
  options: SelectOption[]
}

/** Selector con etiqueta asociada automáticamente. */
export function SelectField({
  label,
  hint,
  id,
  options,
  ...select
}: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      <select className={styles.control} id={fieldId} {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint !== undefined && <p className={styles.hint}>{hint}</p>}
    </div>
  )
}
