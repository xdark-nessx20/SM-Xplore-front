import type { ButtonHTMLAttributes } from 'react'
import { classNames } from '@/utils/format'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual del botón. */
  variant?: ButtonVariant
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(styles.button, styles[variant], className)}
      {...props}
    />
  )
}
