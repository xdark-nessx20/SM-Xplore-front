import { classNames } from '@/utils/format'
import styles from './Logo.module.css'

export interface LogoProps {
  size?: 'md' | 'lg'
  /** `inverse` para barras oscuras (todo el logo en blanco). */
  tone?: 'default' | 'inverse'
}

/** Logotipo de dos tonos: "SM-" en navy y "Xplore" en teal. */
export function Logo({ size = 'md', tone = 'default' }: LogoProps) {
  return (
    <span
      className={classNames(styles.logo, styles[size], styles[tone])}
      aria-label="SM-Xplore"
    >
      <span className={styles.mark}>SM-</span>
      <span className={styles.accent}>Xplore</span>
    </span>
  )
}
