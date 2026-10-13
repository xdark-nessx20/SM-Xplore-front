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
import ActivityDetailPage from '@/pages/catalog/ActivityDetailPage'
import ExplorePage from '@/pages/catalog/ExplorePage'
import EventDetailPage from '@/pages/events/EventDetailPage'
import EventFormPage from '@/pages/events/EventFormPage'
import EventListPage from '@/pages/events/EventListPage'
import EventManageDetailPage from '@/pages/events/EventManageDetailPage'
import ManageEventsPage from '@/pages/events/ManageEventsPage'
import PlannedEventsPage from '@/pages/events/PlannedEventsPage'
import ActivityFormPage from '@/pages/guide/ActivityFormPage'
import ActivityManagePage from '@/pages/guide/ActivityManagePage'
import AvailabilityPage from '@/pages/guide/AvailabilityPage'
import MyActivitiesPage from '@/pages/guide/MyActivitiesPage'
import ItineraryPage from '@/pages/itinerary/ItineraryPage'
import GuideProfilePage from '@/pages/profile/GuideProfilePage'
import MyProfilePage from '@/pages/profile/MyProfilePage'
import ProviderProfilePage from '@/pages/profile/ProviderProfilePage'
import ReceivedReservationDetailPage from '@/pages/provider/ReceivedReservationDetailPage'
import ReceivedReservationsPage from '@/pages/provider/ReceivedReservationsPage'
import MyServicesPage from '@/pages/provider/MyServicesPage'
import ServiceFormPage from '@/pages/provider/ServiceFormPage'
import ServiceManagePage from '@/pages/provider/ServiceManagePage'
import MyReservationsPage from '@/pages/reservations/MyReservationsPage'
import ReservationDetailPage from '@/pages/reservations/ReservationDetailPage'
import ManageReportsPage from '@/pages/reports/ManageReportsPage'
import MyReportsPage from '@/pages/reports/MyReportsPage'
import ReportDetailPage from '@/pages/reports/ReportDetailPage'
import ReportFormPage from '@/pages/reports/ReportFormPage'
import ZoneFormPage from '@/pages/zones/ZoneFormPage'
import ZonesListPage from '@/pages/zones/ZonesListPage'
import { RequireAuth, RequireRole } from './guards'

/** Secciones del menú del panel que ya tienen pantalla propia. */
const IMPLEMENTED_SECTIONS = new Set([
  '/app/usuarios',
  '/app/perfil',
  '/app/reservas-recibidas',
  '/app/mis-actividades',
  '/app/disponibilidad',
  '/app/eventos',
  '/app/mis-servicios',
  '/app/reportes',
  '/app/zonas',
])

/** El resto de secciones existe como ruta provisional hasta implementarlas. */
const sectionRoutes = NAV_ITEMS.filter(
  (item) => item.to.startsWith('/app/') && !IMPLEMENTED_SECTIONS.has(item.to),
).map((item) => ({
  path: item.to.replace('/app/', ''),
  element: (
    <RequireRole roles={item.roles}>
      <Placeholder title={item.label} description={item.description} />
    </RequireRole>
  ),
}))

/** Rutas del catálogo público que ya tienen pantalla propia. */
const IMPLEMENTED_PUBLIC = new Set(['/explorar', '/eventos'])

/** El resto del catálogo queda provisional. */
const publicRoutes = PUBLIC_NAV.filter(
  (item) => !IMPLEMENTED_PUBLIC.has(item.to),
).map((item) => ({
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
      /* Catálogo de actividades (mockups 06-UC2/UC7/UC8 y 06-UC9) */
      { path: 'explorar', element: <ExplorePage /> },
      { path: 'actividades', element: <Navigate to="/explorar" replace /> },
      { path: 'actividades/:activityId', element: <ActivityDetailPage /> },
      /* Catálogo de eventos (mockups 07: UC4/UC5/UC6/UC7/UC8) */
      { path: 'eventos', element: <EventListPage /> },
      {
        path: 'eventos/planificados',
        element: (
          <RequireAuth>
            <RequireRole roles={['TOURIST']}>
              <PlannedEventsPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      { path: 'eventos/:eventId', element: <EventDetailPage /> },
      /* Perfiles públicos que consulta el turista (wireframes 12-UC4 y 12-UC5) */
      { path: 'guias/:guideId', element: <GuideProfilePage /> },
      { path: 'prestadoras/:providerId', element: <ProviderProfilePage /> },
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
    /* Secciones del turista: usan el shell público, como en los diseños. */
    element: (
      <RequireAuth>
        <PublicLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: 'mis-reservas',
        element: (
          <RequireRole roles={['TOURIST']}>
            <MyReservationsPage />
          </RequireRole>
        ),
      },
      {
        path: 'mis-reservas/:reservationId',
        element: (
          <RequireRole roles={['TOURIST']}>
            <ReservationDetailPage />
          </RequireRole>
        ),
      },
      { path: 'perfil', element: <MyProfilePage /> },
      /* Reportes de seguridad del turista (wireframe 13: UC1/UC2/UC3/UC5) */
      {
        path: 'reportes',
        element: (
          <RequireRole roles={['TOURIST']}>
            <MyReportsPage />
          </RequireRole>
        ),
      },
      {
        path: 'reportes/nuevo',
        element: (
          <RequireRole roles={['TOURIST']}>
            <ReportFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'reportes/:reportId',
        element: (
          <RequireRole roles={['TOURIST']}>
            <ReportDetailPage />
          </RequireRole>
        ),
      },
      {
        path: 'itinerario',
        element: (
          <RequireRole roles={['TOURIST']}>
            <ItineraryPage />
          </RequireRole>
        ),
      },
      {
        path: 'reportes',
        element: (
          <Placeholder
            title="Reportes de seguridad"
            description="Reportar incidentes, seguimiento de estado, fotos y comentarios."
          />
        ),
      },
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
        path: 'reservas-recibidas',
        element: (
          <RequireRole roles={['GUIDE', 'SERVICE_PROVIDER']}>
            <ReceivedReservationsPage />
          </RequireRole>
        ),
      },
      {
        path: 'reservas-recibidas/:reservationId',
        element: (
          <RequireRole roles={['GUIDE', 'SERVICE_PROVIDER']}>
            <ReceivedReservationDetailPage />
          </RequireRole>
        ),
      },
      /* Actividades del guía (mockups 06: UC1, UC3 y UC4/UC5/UC6) */
      {
        path: 'mis-actividades',
        element: (
          <RequireRole roles={['GUIDE', 'DESTINATION_MANAGER', 'ADMIN']}>
            <MyActivitiesPage />
          </RequireRole>
        ),
      },
      {
        path: 'mis-actividades/nueva',
        element: (
          <RequireRole roles={['GUIDE', 'DESTINATION_MANAGER', 'ADMIN']}>
            <ActivityFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'mis-actividades/:activityId',
        element: (
          <RequireRole roles={['GUIDE', 'DESTINATION_MANAGER', 'ADMIN']}>
            <ActivityManagePage />
          </RequireRole>
        ),
      },
      {
        path: 'disponibilidad',
        element: (
          <RequireRole roles={['GUIDE', 'DESTINATION_MANAGER', 'ADMIN']}>
            <AvailabilityPage />
          </RequireRole>
        ),
      },
      /* Gestión de eventos (mockups 07: UC1/UC3 y UC2/UC4/UC5) */
      {
        path: 'eventos',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER', 'ADMIN']}>
            <ManageEventsPage />
          </RequireRole>
        ),
      },
      {
        path: 'eventos/nuevo',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER', 'ADMIN']}>
            <EventFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'eventos/:eventId',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER', 'ADMIN']}>
            <EventManageDetailPage />
          </RequireRole>
        ),
      },
      /* Servicios de la prestadora */
      {
        path: 'mis-servicios',
        element: (
          <RequireRole roles={['SERVICE_PROVIDER', 'ADMIN']}>
            <MyServicesPage />
          </RequireRole>
        ),
      },
      {
        path: 'mis-servicios/nuevo',
        element: (
          <RequireRole roles={['SERVICE_PROVIDER', 'ADMIN']}>
            <ServiceFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'mis-servicios/:serviceId',
        element: (
          <RequireRole roles={['SERVICE_PROVIDER', 'ADMIN']}>
            <ServiceManagePage />
          </RequireRole>
        ),
      },
      /* Reportes de seguridad (gestora y admin) — wireframe 13-UC4 */
      {
        path: 'reportes',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER', 'ADMIN']}>
            <ManageReportsPage />
          </RequireRole>
        ),
      },
      /* Zonas y sitios (wireframes 11) — sin API todavía, capa local */
      {
        path: 'zonas',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER']}>
            <ZonesListPage />
          </RequireRole>
        ),
      },
      {
        path: 'zonas/nueva',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER']}>
            <ZoneFormPage />
          </RequireRole>
        ),
      },
      {
        path: 'zonas/:zoneId',
        element: (
          <RequireRole roles={['DESTINATION_MANAGER']}>
            <ZoneFormPage />
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
