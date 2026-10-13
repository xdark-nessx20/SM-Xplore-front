import type { ReactNode } from 'react'
import { classNames } from '@/utils/format'
import styles from './DataTable.module.css'

export interface Column<T> {
  header: ReactNode
  render: (row: T) => ReactNode
  /** Alinea el contenido a la derecha (acciones, importes…). */
  align?: 'left' | 'right'
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Mensaje cuando no hay filas. */
  emptyMessage?: string
  /** Mientras la primera carga está en curso. */
  isLoading?: boolean
  loadingMessage?: string
}

/** Tabla de datos con encabezado y estado vacío. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'Sin resultados.',
  isLoading = false,
  loadingMessage = 'Cargando…',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loading}>{loadingMessage}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={classNames(
                  column.align === 'right' && styles.alignRight,
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={classNames(
                      column.align === 'right' && styles.alignRight,
                      column.className,
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
