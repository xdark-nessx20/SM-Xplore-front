import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Field } from '@/components/FormField'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { REPORT_STATUS_LABELS, REPORT_STATUS_TONES } from '@/config/roles'
import { useAuth } from '@/hooks/useAuth'
import { securityReportsApi } from '@/services/securityReportsApi'
import { describeApiError } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'
import type { CommentResponse, SecurityReportResponse } from '@/types'
import styles from './reports.module.css'

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const { user } = useAuth()

  const [report, setReport] = useState<SecurityReportResponse | null>(null)
  const [comments, setComments] = useState<CommentResponse[]>([])
  const [newText, setNewText] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (reportId === undefined) {
      return
    }

    let cancelled = false

    async function run() {
      try {
        const [found, foundComments] = await Promise.all([
          securityReportsApi.getById(reportId as string),
          securityReportsApi.listComments(reportId as string),
        ])

        if (cancelled) return

        setReport(found)
        setNewText(found.text)
        setComments(foundComments)
        setError(null)
      } catch (cause) {
        if (!cancelled) setError(describeApiError(cause))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [reportId])

  if (isLoading) {
    return <p className={styles.page}>Cargando reporte…</p>
  }

  if (report === null) {
    return (
      <div className={styles.page}>
        <Link to="/reportes" className={styles.back}>
          ← Volver a mis reportes
        </Link>
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error ?? 'No se encontró el reporte.'}
        </p>
      </div>
    )
  }

  const current = report

  async function runAction(action: () => Promise<unknown>, message: string) {
    setIsWorking(true)
    setError(null)
    setFeedback(null)

    try {
      await action()
      setFeedback(message)
    } catch (cause) {
      setError(describeApiError(cause))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <div className={styles.page}>
      <Link to="/reportes" className={styles.back}>
        ← Volver a mis reportes
      </Link>

      <PageHeader
        title="Detalle del reporte"
        description={`Creado el ${formatDateTime(current.createdAt)}`}
        actions={
          <StatusBadge tone={REPORT_STATUS_TONES[current.status]}>
            {REPORT_STATUS_LABELS[current.status]}
          </StatusBadge>
        }
      />

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}
      {feedback !== null && (
        <p className={`${styles.feedback} ${styles.success}`}>{feedback}</p>
      )}

      <div className={styles.layout}>
        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Descripción</h2>
            <textarea
              className={styles.textarea}
              value={newText}
              onChange={(changeEvent) => setNewText(changeEvent.target.value)}
            />
            <div className={styles.actions}>
              <Button
                variant="accent"
                disabled={isWorking || newText.trim() === ''}
                onClick={() =>
                  void runAction(async () => {
                    const updated = await securityReportsApi.changeText(
                      current.id,
                      { text: newText.trim() },
                    )
                    setReport(updated)
                  }, 'Texto del reporte actualizado.')
                }
              >
                Guardar texto
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Fotos</h2>

            {current.photosUrls.length === 0 ? (
              <p className={styles.helper}>Todavía no hay fotos.</p>
            ) : (
              <ul className={styles.legend} style={{ display: 'grid' }}>
                {current.photosUrls.map((url) => (
                  <li key={url} className={styles.authorMeta}>
                    {url}
                  </li>
                ))}
              </ul>
            )}

            <Field
              label="Añadir foto (URL)"
              placeholder="https://…/foto.jpg"
              value={photoUrl}
              onChange={(changeEvent) => setPhotoUrl(changeEvent.target.value)}
            />
            <div className={styles.actions}>
              <Button
                variant="outline"
                disabled={isWorking || photoUrl.trim() === ''}
                onClick={() =>
                  void runAction(async () => {
                    const updated = await securityReportsApi.addPhotos(
                      current.id,
                      { photosUrls: [photoUrl.trim()] },
                    )
                    setReport(updated)
                    setPhotoUrl('')
                  }, 'Foto añadida.')
                }
              >
                Añadir foto
              </Button>
            </div>
          </article>

          <article className={styles.card}>
            <h2 className={styles.cardTitle}>
              Respuestas ({comments.length})
            </h2>

            {comments.length === 0 && (
              <p className={styles.helper}>Todavía no hay respuestas.</p>
            )}

            {comments.map((item) => (
              <div key={item.id} className={styles.comment}>
                <p className={styles.commentAuthor}>{item.user.name}</p>
                <p className={styles.commentText}>{item.content}</p>
              </div>
            ))}

            <div className={styles.actions}>
              <Field
                label="Responder"
                placeholder="Escribe una respuesta…"
                value={comment}
                onChange={(changeEvent) => setComment(changeEvent.target.value)}
              />
              <Button
                variant="accent"
                disabled={
                  isWorking || comment.trim() === '' || user === null
                }
                onClick={() =>
                  void runAction(async () => {
                    await securityReportsApi.addComment(current.id, {
                      user: { id: user!.id, name: user!.fullName },
                      content: comment.trim(),
                    })
                    const updated = await securityReportsApi.listComments(
                      current.id,
                    )
                    setComments(updated)
                    setComment('')
                  }, 'Respuesta publicada.')
                }
              >
                Publicar
              </Button>
            </div>
          </article>
        </div>

        <div className={styles.column}>
          <article className={styles.card}>
            <h2 className={styles.cardTitle}>Resumen</h2>
            <div className={styles.footer}>
              <span>Autor</span>
              <span>{current.user.name}</span>
            </div>
            <div className={styles.footer}>
              <span>Ubicación</span>
              <span>
                {current.location === null
                  ? 'Sin ubicación'
                  : `${current.location.latitude}, ${current.location.longitude}`}
              </span>
            </div>
            <div className={styles.footer}>
              <span>Fotos</span>
              <span>{current.photosUrls.length}</span>
            </div>

            <p className={styles.notice}>
              Cerrar el reporte (pasar a "Reportado") solo lo pueden hacer las
              gestoras de destino y los administradores. "Resuelto" existe en el
              dominio pero ningún endpoint lo aplica.
            </p>
          </article>
        </div>
      </div>
    </div>
  )
}
