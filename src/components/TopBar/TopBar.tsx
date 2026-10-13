import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { classNames } from '@/utils/format'
import styles from './TopBar.module.css'

export interface TopBarLink {
  to: string
  label: string
}

export interface TopBarProps {
  /** `light` para páginas públicas, `dark` para las barras navy. */
  tone?: 'light' | 'dark'
  /** Muestra el buscador central. */
  search?: boolean
  /** Píldora junto al logo (p. ej. "Panel de gestión"). */
  badge?: string
  links?: TopBarLink[]
  /** Acciones del extremo derecho (botón, avatar, menú…). */
  right?: ReactNode
  /** Se invoca al enviar el buscador. */
  onSearch?: (term: string) => void
}

export function TopBar({
  tone = 'light',
  search = false,
  badge,
  links = [],
  right,
  onSearch,
}: TopBarProps) {
  const [term, setTerm] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch?.(term.trim())
  }

  return (
    <header className={classNames(styles.bar, tone === 'dark' && styles.dark)}>
      <Link to="/" aria-label="Ir al inicio">
        <Logo tone={tone === 'dark' ? 'inverse' : 'default'} />
      </Link>

      {badge !== undefined && <span className={styles.badge}>{badge}</span>}

      {search && (
        <form className={styles.search} onSubmit={handleSubmit} role="search">
          <input
            type="search"
            name="term"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar actividades, atractivos, eventos…"
            aria-label="Buscar"
          />
        </form>
      )}

      {links.length > 0 && (
        <nav className={styles.links}>
          {links.map((link) => (
            <Link key={link.label} to={link.to} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {right !== undefined && <div className={styles.right}>{right}</div>}
    </header>
  )
}
