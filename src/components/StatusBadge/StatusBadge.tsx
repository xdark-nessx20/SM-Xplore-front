import type { ReactNode } from 'react'
import { classNames } from '@/utils/format'
import type { BadgeTone } from '@/types'
import styles from './StatusBadge.module.css'

export interface StatusBadgeProps {
  tone: BadgeTone
  children: ReactNode
}

/** Etiqueta de estado (Activo, Pendiente, Bloqueado…). */
export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span className={classNames(styles.badge, styles[tone])}>{children}</span>
  )
}
