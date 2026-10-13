import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { TopBar } from '@/components/TopBar'
import { PUBLIC_NAV } from '@/config/navigation'
import { useAuth } from '@/hooks/useAuth'
import styles from './PublicLayout.module.css'

/**
 * Shell de las páginas públicas: barra superior clara con buscador,
 * contenido y pie de página.
 */
export function PublicLayout() {
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  // El buscador solo aparece en el catálogo, como en los diseños.
  const isCatalog = PUBLIC_NAV.some((item) => pathname.startsWith(item.to))

  return (
    <div className={styles.shell}>
      <TopBar
        search={isCatalog}
        links={PUBLIC_NAV}
        right={
          isAuthenticated ? (
            <>
              <Link to="/app">
                <Button variant="outline" size="sm">
                  Ir al panel
                </Button>
              </Link>
              <span className={styles.avatar} aria-hidden="true" />
            </>
          ) : (
            <Link to="/registro">
              <Button variant="outline">Crear cuenta</Button>
            </Link>
          )
        }
      />

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}
