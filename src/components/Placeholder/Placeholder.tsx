import styles from './Placeholder.module.css'

export interface PlaceholderProps {
  title: string
  description: string
}

/** Pantalla provisional mientras se implementan los wireframes de Figma. */
export function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <p className={styles.note}>
        Pendiente de implementar con los wireframes de Figma.
      </p>
    </section>
  )
}
