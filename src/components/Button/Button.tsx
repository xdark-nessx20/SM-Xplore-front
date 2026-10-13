import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '@/utils/format'
import styles from './Button.module.css'

/** `primary`: navy relleno · `accent`: teal relleno · `outline`/`outlineAccent`: contorno. */
export type ButtonVariant = 'primary' | 'accent' | 'outline' | 'outlineAccent'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Ocupa todo el ancho disponible. */
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        block && styles.block,
        className,
      )}
      {...props}
    />
  )
}
