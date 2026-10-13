import type { ReactNode } from 'react'
import styles from './auth.module.css'

export interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/** Tarjeta centrada que envuelve las pantallas de autenticación. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {children}
        {footer !== undefined && <div className={styles.footer}>{footer}</div>}
      </section>
    </div>
  )
}
