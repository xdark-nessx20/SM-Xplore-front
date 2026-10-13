import type { UserRole } from '@/types'

export interface NavItem {
  /** Ruta dentro del shell autenticado. */
  to: string
  label: string
  /** Qué debe ofrecer esta sección (se usa como texto provisional hasta tener los wireframes). */
  description: string
  /** Roles que pueden ver la sección. */
  roles: UserRole[]
}

/**
 * Secciones de la aplicación. Por ahora son provisionales: cada una es una
 * pantalla pendiente de los wireframes de Figma.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    to: '/app/explorar',
    label: 'Explorar',
    description:
      'Catálogo público: eventos, actividades y servicios turísticos disponibles, con búsqueda y filtros.',
    roles: ['TOURIST'],
  },
  {
    to: '/app/mis-reservas',
    label: 'Mis reservas',
    description:
      'Reservas del turista con su estado, total, ítems y acciones (cancelar, solicitar cancelación).',
    roles: ['TOURIST'],
  },
  {
    to: '/app/mis-actividades',
    label: 'Mis actividades',
    description:
      'Actividades asignadas al guía: agenda, disponibilidad, cupos y estado.',
    roles: ['GUIDE'],
  },
  {
    to: '/app/mis-servicios',
    label: 'Mis servicios',
    description:
      'Servicios de la prestadora: precio, fotos, atributos extra y disponibilidad.',
    roles: ['SERVICE_PROVIDER'],
  },
  {
    to: '/app/reservas-recibidas',
    label: 'Reservas recibidas',
    description:
      'Reservas asociadas a los ítems de la prestadora: confirmar, rechazar o marcar asistencia.',
    roles: ['SERVICE_PROVIDER', 'GUIDE'],
  },
  {
    to: '/app/sitios',
    label: 'Destinos y sitios',
    description:
      'Sitios y zonas bajo gestión de la entidad de destinos, con sus atractivos.',
    roles: ['DESTINATION_MANAGER'],
  },
  {
    to: '/app/eventos',
    label: 'Eventos',
    description:
      'Crear y publicar eventos, estimar asistencia y gestionar su estado.',
    roles: ['DESTINATION_MANAGER'],
  },
  {
    to: '/app/usuarios',
    label: 'Usuarios',
    description:
      'Búsqueda de usuarios, asignación de roles, bloqueo y restablecimiento de contraseña.',
    roles: ['ADMIN'],
  },
  {
    to: '/app/reportes',
    label: 'Reportes de seguridad',
    description:
      'Reportar incidentes de seguridad, seguimiento de estado, fotos y comentarios.',
    roles: [
      'TOURIST',
      'GUIDE',
      'SERVICE_PROVIDER',
      'DESTINATION_MANAGER',
      'ADMIN',
    ],
  },
  {
    to: '/app/perfil',
    label: 'Mi perfil',
    description:
      'Datos personales, actualización del perfil, cambio de contraseña y eliminación de la cuenta.',
    roles: [
      'TOURIST',
      'GUIDE',
      'SERVICE_PROVIDER',
      'DESTINATION_MANAGER',
      'ADMIN',
    ],
  },
]

/** Secciones visibles para un rol. */
export function navItemsFor(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export interface PublicNavItem {
  to: string
  label: string
}

/**
 * Navegación del catálogo público (barra superior clara).
 * Las pantallas todavía son provisionales.
 */
export const PUBLIC_NAV: PublicNavItem[] = [
  { to: '/explorar', label: 'Atractivos' },
  { to: '/actividades', label: 'Actividades' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/servicios', label: 'Servicios' },
]
