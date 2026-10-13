import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/Avatar/Avatar'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { DataTable } from '@/components/DataTable/DataTable'
import type { Column } from '@/components/DataTable/DataTable'
import { PageHeader } from '@/components/PageHeader/PageHeader'
import { Pagination } from '@/components/Pagination/Pagination'
import { SearchInput } from '@/components/SearchInput/SearchInput'
import { StatusBadge } from '@/components/StatusBadge/StatusBadge'
import { ROLE_LABELS, STATUS_LABELS, STATUS_TONES } from '@/config/roles'
import { usersApi } from '@/services/usersApi'
import { describeApiError } from '@/utils/errors'
import { formatDate } from '@/utils/format'
import type { UserResponse, UserRole } from '@/types'
import styles from './admin.module.css'

const PAGE_SIZE = 10

const ROLE_FILTERS: Array<{ label: string; role?: UserRole }> = [
  { label: 'Todos' },
  { label: 'Turistas', role: 'TOURIST' },
  { label: 'Guías', role: 'GUIDE' },
  { label: 'Prestadoras', role: 'SERVICE_PROVIDER' },
  { label: 'Gestoras', role: 'DESTINATION_MANAGER' },
  { label: 'Admin', role: 'ADMIN' },
]

type SortOrder = 'recent' | 'oldest'

/** Las prestadoras se revisan en su pantalla de solicitud. */
function detailPathFor(user: UserResponse): string {
  return user.role === 'SERVICE_PROVIDER'
    ? `/app/usuarios/prestadoras/${user.id}`
    : `/app/usuarios/${user.id}`
}

export default function UsersPage() {
  const navigate = useNavigate()

  const [term, setTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [role, setRole] = useState<UserRole | undefined>(undefined)
  const [sort, setSort] = useState<SortOrder>('recent')
  const [users, setUsers] = useState<UserResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(term), 350)
    return () => clearTimeout(timer)
  }, [term])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await usersApi.search({
          role,
          term: debouncedTerm.trim() === '' ? undefined : debouncedTerm.trim(),
        })

        if (!cancelled) {
          setUsers(result)
          setPage(1)
        }
      } catch (cause) {
        if (!cancelled) {
          setUsers([])
          setError(describeApiError(cause))
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [role, debouncedTerm])

  const sorted = useMemo(
    () =>
      [...users].sort((a, b) => {
        const diff =
          new Date(a.signedUpAt).getTime() - new Date(b.signedUpAt).getTime()
        return sort === 'recent' ? -diff : diff
      }),
    [users, sort],
  )

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns: Column<UserResponse>[] = [
    {
      header: 'Usuario',
      render: (user) => (
        <div className={styles.userCell}>
          <Avatar name={user.fullName} />
          <div>
            <p className={styles.userName}>{user.fullName}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Rol',
      render: (user) => ROLE_LABELS[user.role],
    },
    {
      header: 'Estado',
      render: (user) => {
        if (user.registrationStatus === 'REJECTED') {
          return <StatusBadge tone="danger">Registro rechazado</StatusBadge>
        }
        if (user.status === 'INACTIVE') {
          return <StatusBadge tone="warning">Registro pendiente</StatusBadge>
        }
        return (
          <StatusBadge tone={STATUS_TONES[user.status]}>
            {STATUS_LABELS[user.status]}
          </StatusBadge>
        )
      },
    },
    {
      header: 'Registro',
      render: (user) => formatDate(user.signedUpAt),
    },
    {
      header: 'Acciones',
      align: 'right',
      render: (user) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(detailPathFor(user))}
        >
          Ver
        </Button>
      ),
    },
  ]

  return (
    <section>
      <PageHeader
        breadcrumb={[{ label: 'Usuarios' }, { label: 'Listado' }]}
        title="Usuarios registrados"
        meta={`${sorted.length} ${sorted.length === 1 ? 'usuario' : 'usuarios'}`}
      />

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <SearchInput
            label="Buscar por nombre o correo"
            placeholder="Buscar por nombre o correo…"
            value={term}
            onChange={setTerm}
          />
        </div>

        <div className={styles.chips}>
          {ROLE_FILTERS.map((filter) => (
            <Chip
              key={filter.label}
              selected={role === filter.role}
              onClick={() => setRole(filter.role)}
            >
              {filter.label}
            </Chip>
          ))}
        </div>

        <select
          className={styles.sort}
          value={sort}
          onChange={(event) => setSort(event.target.value as SortOrder)}
          aria-label="Ordenar"
        >
          <option value="recent">Ordenar: más recientes</option>
          <option value="oldest">Ordenar: más antiguos</option>
        </select>
      </div>

      {error !== null && (
        <p className={`${styles.feedback} ${styles.error}`} role="alert">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        loadingMessage="Cargando usuarios…"
        emptyMessage="No hay usuarios que coincidan con los filtros."
      />

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  )
}
