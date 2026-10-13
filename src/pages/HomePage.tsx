import { Button } from '@/components/Button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import styles from './HomePage.module.css'

export default function HomePage() {
  const [clicks, setClicks] = useLocalStorage('sm-xplore:clicks', 0)

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>SM-Xplore</h1>
      <p className={styles.subtitle}>
        Plantilla base con React, TypeScript y Vite.
      </p>

      <section className={styles.card}>
        <p className={styles.counter}>Clics guardados: {clicks}</p>
        <div className={styles.actions}>
          <Button onClick={() => setClicks((current) => current + 1)}>
            Incrementar
          </Button>
          <Button variant="secondary" onClick={() => setClicks(0)}>
            Reiniciar
          </Button>
        </div>
      </section>
    </main>
  )
}
