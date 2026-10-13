import styles from './Footer.module.css'

const SOCIALS = ['Instagram', 'Facebook', 'X', 'YouTube', 'TikTok']

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.bar}>
        <span className={styles.title}>Síguenos en redes</span>

        <ul className={styles.social}>
          {SOCIALS.map((name) => (
            <li key={name}>
              <a className={styles.socialItem} href="#">
                <span className={styles.dot} aria-hidden="true" />
                {name}
              </a>
            </li>
          ))}
        </ul>

        <span className={styles.copy}>© 2026 SM-Xplore</span>
      </div>
    </footer>
  )
}
