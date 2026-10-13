import { Link } from 'react-router-dom'
import { Button } from '@/components/Button'
import type { Site } from '@/types'
import styles from './SiteCard.module.css'

export interface SiteCardProps {
  site: Site
  /** Nombre de la zona a la que pertenece, si se conoce. */
  zoneName: string | undefined
}

/** Tarjeta del catálogo de atractivos: foto (si hay), nombre, zona y coordenadas. */
export function SiteCard({ site, zoneName }: SiteCardProps) {
  const photo = site.photoUrls[0]

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {photo !== undefined ? (
          <img className={styles.photo} src={photo} alt="" loading="lazy" />
        ) : (
          <span className={styles.mediaNote}>Sin foto</span>
        )}
      </div>

      <h3 className={styles.name}>{site.name}</h3>
      <p className={styles.meta}>
        {zoneName ?? 'Zona sin publicar'} · {site.latitude.toFixed(4)},{' '}
        {site.longitude.toFixed(4)}
      </p>

      <Link to={`/atractivos/${site.id}`}>
        <Button variant="outline" block>
          Ver detalle
        </Button>
      </Link>
    </article>
  )
}
