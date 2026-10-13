import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Placeholder } from '@/components/Placeholder'
import { NAV_ITEMS, PUBLIC_NAV } from '@/config/navigation'
import { AppLayout } from '@/layouts/AppLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import DashboardPage from '@/pages/DashboardPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProviderApprovalPage from '@/pages/admin/ProviderApprovalPage'
import UserDetailPage from '@/pages/admin/UserDetailPage'
import UsersPage from '@/pages/admin/UsersPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import GuideProfilePage from '@/pages/profile/GuideProfilePage'
import MyProfilePage from '@/pages/profile/MyProfilePage'
import ProviderProfilePage from '@/pages/profile/ProviderProfilePage'
import { RequireAuth, RequireRole } from './guards'

/** Secciones del menú que ya tienen pantalla propia. */
const IMPLEMENTED_SECTIONS = new Set(['/app/usuarios', '/app/perfil'])

/** El resto de secciones existe como ruta provisional hasta implementarlas. */
const sectionRoutes = NAV_ITEMS.filter(
  (item) => !IMPLEMENTED_SECTIONS.has(item.to),
).map((item) => ({
  path: item.to.replace('/app/', ''),
  element: (
    <RequireRole roles={item.roles}>
      <Placeholder title={item.label} description={item.description} />
    </RequireRole>
  ),
}))

/** Rutas públicas del catálogo, pendientes de implementar. */
const publicRoutes = PUBLIC_NAV.map((item) => ({
  path: item.to,
  element: (
    <Placeholder
      title={item.label}
      description={`Catálogo público de ${item.label.toLowerCase()}: listado con filtros, tarjetas y detalle.`}
    />
  ),
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Navigate to="/explorar" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
      ...publicRoutes,
      /* Perfiles públicos que consulta el turista (wireframes 12-UC4 y 12-UC5) */
      { path: 'guias/:guideId', element: <GuideProfilePage /> },
      { path: 'prestadoras/:providerId', element: <ProviderProfilePage /> },
      {
        path: 'actividades/:activityId',
        element: (
          <Placeholder
            title="Detalle de actividad"
            description="Ficha de la actividad, calendario de disponibilidad, cupos y reserva."
          />
        ),
      },
      {
        path: 'servicios/:serviceId',
        element: (
          <Placeholder
            title="Detalle de servicio"
            description="Ficha del servicio turístico, fotos, atributos extra y reserva."
          />
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      ...sectionRoutes,
      /* Gestión de usuarios (admin) — wireframes 12-UC6 y 12-UC7 */
      {
        path: 'usuarios',
        element: (
          <RequireRole roles={['ADMIN']}>
            <UsersPage />
          </RequireRole>
        ),
      },
      {
        path: 'usuarios/prestadoras/:providerId',
        element: (
          <RequireRole roles={['ADMIN']}>
            <ProviderApprovalPage />
          </RequireRole>
        ),
      },
      {
        path: 'perfil',
        element: <MyProfilePage />,
      },
      {
        path: 'usuarios/:userId',
        element: (
          <RequireRole roles={['ADMIN']}>
            <UserDetailPage />
          </RequireRole>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
