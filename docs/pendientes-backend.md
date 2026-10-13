# Pendientes del backend (SM-Xplore-Proto)

Brief para la sesión que trabaje el backend. Analizado en `develop` · commit **`b7fc58f`**
(merge del PR #8 «security»). El frontend (`SM-Xplore-front`) ya consume este contrato.

> **Estado (octubre 2026):** el backend ya implementó buena parte de este brief: sitios y zonas,
> catálogo público anónimo, rechazo de prestadoras y `registrationStatus` en los listados,
> edición de eventos (`PUT`), reservas por prestadora/guía/ítem con `code`, reportes resueltos y
> `user` derivado del token. Siguen pendientes: reseñas, itinerarios, subida de archivos,
> turnos/cierres por día, cambio de contraseña propio con contraseña actual y recuperación de
> contraseña real.

## 0. Cómo orientarse

- Repo: `SM-Xplore-Proto` — Spring Boot 4 WebFlux, hexagonal (`domain` / `application` /
  `infrastructure`). Código en inglés, use cases con `handle`, puertos `IXUseCase`, relaciones por UUID.
- Levantar en local: `POSTGRES_PORT=5433 docker compose up -d mongodb postgres` (el 5432 suele estar
  ocupado por un Postgres del sistema) y luego `./gradlew bootRun`. O todo con
  `docker compose up --build` (perfil `docker`).
- Admin inicial: `AdminBootstrapRunner` crea un admin si `ADMIN_EMAIL` y `ADMIN_PASSWORD` no están
  vacíos (en docker: `admin@ahorasi.local` / `Admin123*`).
- Tests: `./gradlew test` — usan **Testcontainers**, requiere Docker. Referencia del flujo con JWT:
  `src/test/java/com/smxplore/proto/SecurityIntegrationTest.java`.
- Swagger: <http://localhost:8080/swagger-ui.html> (esquema `bearerAuth`).

---

## 1. Decisiones que necesito del equipo (bloquean pantallas del turista)

1. **Catálogo público.** Hoy `SecurityConfiguration` deja todo lo que no sea auth/health/Swagger en
   `anyExchange().authenticated()`. Los diseños de Figma tienen catálogo **sin sesión**:
   Explorar, Eventos, Servicios, Atractivos y los perfiles de guía y prestadora.
   - Opción A: abrir con `permitAll` los `GET` de `/events`, `/activities`, `/services` y
     `/users/guides/{id}`, `/users/providers/{id}` (solo lectura y solo lo publicado).
   - Opción B: mantener todo con sesión y rediseñamos la experiencia anónima.
   Impacto: 6 pantallas del turista.
2. **GUIDE y las reservas.** El wireframe dice «Prestadora y guía ven aquí Confirmar / Rechazar»,
   pero solo `SERVICE_PROVIDER`, `DESTINATION_MANAGER` y `ADMIN` están autorizados en
   `confirm` / `reject` / `attendance` / `no-show`. La pantalla «Reservas recibidas» de un guía
   recibe **403**. ¿Añadimos GUIDE (con validación de propiedad) o dejamos la pantalla solo para
   prestadoras?
3. **Refresh token / logout.** El JWT dura 60 min (`JWT_EXPIRATION_MINUTES`) y no hay refresh ni
   revocación; bloquear a un usuario no invalida sus tokens. ¿Se añade refresh (y revocación) o el
   frontend se queda con re-login al expirar?

---

## 2. Endpoints que faltan

En la columna «ya existe» está lo que se puede reutilizar para no reinventar el dominio.

| Módulo | Qué falta | Ya existe en el repo | Pantalla que desbloquea |
| --- | --- | --- | --- |
| **Sitios y zonas** | Controlador, DTOs, use cases y adaptadores (no hay tabla ni endpoint) | `domain/model/site/Site.java`, `domain/model/zone/Zone.java`, `ISiteRepository`, `IZoneRepository` | Zonas y atractivos, «Configurar zona», filtro por zona en los catálogos, lugar real en eventos y actividades. **Ojo: sí hay diseños de este módulo** (ver abajo) |
| **Reseñas** | Todo (no hay entidad ni puerto) | Nada | 5 pantallas de Reseñas (turista y prestadora) |
| **Itinerarios** | Todo | Nada (hoy el frontend lo guarda en `localStorage`) | Persistir el itinerario del turista |
| **Rechazar prestadora** | Endpoint (solo existe aprobar) | `ServiceProvider.rejectRegistration()` y `RegistrationStatus.REJECTED` sin usar | Botón «Rechazar» en Aprobar registro |
| **Solicitudes pendientes** | `GET /users/search?role=SERVICE_PROVIDER&status=INACTIVE` devuelve `UserResponse` **sin** `registrationStatus` → añadirlo al DTO o un endpoint de solicitudes | `registrationStatus` ya en `ServiceProviderProfileResponse` | Listado de solicitudes por aprobar |
| **Editar evento** | No hay `PUT/PATCH` del evento | Entidad `Event` y validaciones de dominio | Formulario de edición (hoy solo estado + afluencia) |
| **Modificar reserva** | Cambiar fechas, personas o ítems | `Reservation.changePrice(...)` existe sin exponer; no hay `changeDates`/`changeNumberOfPeople` ni update/delete de ítems | «Modificar reserva» (hoy deshabilitado con nota) |
| **Reservas por prestadora** | `GET /reservations?providerId=` o por guía | `ReservationRepositoryPort` solo tiene `findById`, `findAllByTouristId`, `findAllByStatus`; `Reservation` no guarda prestadora | «Reservas recibidas» hoy hace 7 consultas + ítems y filtra en cliente (no escala) |
| **Número legible** | Campo tipo `R-1024` | Nada (`Reservation` solo tiene UUID) | Cabeceras de reserva y listados |
| **Cambio de contraseña propio** | Endpoint con contraseña actual | Solo `POST /users/{id}/reset-password` (admin) | (pendiente de diseño) |
| **Recuperar contraseña real** | Envío de correo / token | `RecoverPasswordUseCase` es un **stub no-operativo** (responde 202 y no hace nada) | La pantalla de recuperación ya está construida y hoy «no hace nada» |
| **Subida de archivos** | Multipart o servicio de archivos | Solo `photosUrls` (URLs) en servicios y reportes | Fotos de actividades, eventos, reportes y servicios |
| **Reportes → Resuelto** | Endpoint de transición | `SecurityReportStatus.SOLVED` sin use case que lo aplique | Leyenda «Resueltos» (siempre 0 hoy) |
| **Tipo de reporte y confirmaciones** | «Incidente» vs «Avistamiento» y contador de confirmaciones | Nada (los diseños los piden) | Feed de reportes de la comunidad |
| **Turnos y cierres por día** | Disponibilidad por fecha y cupos por turno | `Activity` tiene un solo `startsAt`/`endsAt` | Calendario de «Disponibilidad y cupos» (hoy simplificado) |
| **Filtros por zona/atractivo** | Depende de sitios y zonas | — | Filtros del catálogo (hoy deshabilitados con nota) |

---

## 2.1 Módulo «Gestionar destino»: campos que piden los diseños

En Figma **sí hay vistas** de zonas (aunque no había API):

- `11-gestionar-destino-frame-115-1326.png` — **Zonas turísticas** (listado).
- `11-gestionar-destino-frame.png` — **Configurar zona turística**.
- `10-gestionar-reservas-07-configurar-zona-1.png` — variante de "Configurar zona".

Campos que necesitan los diseños, más allá de `Site`/`Zone` actuales:

| Campo del diseño | Dónde aparece | Nota para el modelo |
| --- | --- | --- |
| Nombre + descripción de la zona | Listado y configuración | — |
| **Capacidad recomendada** (1.500 personas) | Configurar zona | umbral absoluto de ocupación |
| **Umbral de congestión** (80 %) | Configurar zona | porcentaje que dispara el estado congestionado |
| **Sitios incluidos** (chips + "añadir sitio") | Configurar zona | relación zona ↔ sitios (varios sitios por zona) |
| **Delimitación en el mapa** | Configurar zona | polígono o bbox (hoy ni siquiera hay lat/lng en `Zone`) |
| **Estado de la zona**: Normal / Congestionada | Listado y configuración | con efecto en el turista: "se avisará y se sugerirán zonas alternativas" |
| **Afluencia actual** (85 %, barra) y nº de **atractivos** por zona | Listado | requiere una **fuente de ocupación** que hoy no existe en ningún módulo |
| Ficha de **atractivo/sitio** | Solo ítem de menú | **no hay vista en Figma**; el listado de zonas cuenta sitios |

> Nota: el menú del diseño separa **Zonas** y **Atractivos**; solo hay diseños de Zonas.

---

## 3. Seguridad: validación de propiedad (bug real, no solo feature)

Cualquier usuario autenticado puede leer datos de otros y varios `POST` confían en el **body** en
lugar del token:

- `GET /users/{id}`: cualquier autenticado ve email y teléfono de cualquiera.
- `GET /reservations/{id}` y `/reservations/tourists/{touristId}`: no se compara con el `sub`.
- `POST /reservations`: el `touristId` viene del body → un TOURIST puede reservar a nombre de otro.
- Reportes: `GET /security-reports/{id}`, `/users/{userId}` y comentarios sin validar; `POST` de
  reportes y comentarios toma el `user` del body.
- Actividades y servicios: no se valida que la actividad sea del GUIDE del token ni el servicio de
  esa prestadora.

Sugerencia: derivar el usuario de `Jwt`/`Authentication` (nunca del body) y añadir comprobación de
propiedad. Ya resuelto como referencia: `PUT/DELETE /users/{id}` es self-or-admin.

---

## 4. Contrato ya absorbido por el frontend (no romper sin avisar)

- `POST /api/v1/auth/login` → `AuthResponse { token, tokenType, expiresIn, user }` (antes devolvía el
  usuario plano). El token va en `Authorization: Bearer`.
- Registro: **solo** `TOURIST` y `SERVICE_PROVIDER` (otros roles → 400). La prestadora nace
  `INACTIVE` + `PENDING` y su login da 403 hasta que un admin la aprueba.
- `POST /api/v1/users/{id}/approve-provider` (admin, sin body) → `ServiceProviderProfileResponse`.
- CORS: `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:*`), headers permitidos solo
  `Authorization` y `Content-Type`, sin credenciales.
- Enums serializados por nombre exacto, fechas ISO-8601, y query params **obligatorios** en
  `/services?status`, `/services/search?type=&status=`, `/reservations?status=`,
  `/reservation-items?type=`, `/events/search?name=`, `/activities/search?category=` y
  `/security-reports?status=`. Paginación: `limit` (1–200, por defecto 50).

---

## 5. Cómo verificar lo que se implemente

1. `./gradlew test` (Testcontainers) y tomar `SecurityIntegrationTest` como plantilla para las
   reglas de rol y el flujo con token.
2. Levantar con `docker compose up --build` y probar con el admin de bootstrap.
3. Swagger (`bearerAuth`) para el contrato exacto.
4. Si se tocan reglas de `SecurityConfiguration`, avisar: el frontend tiene rutas públicas
   (`/explorar`, `/eventos`, `/servicios`) que hoy exigen sesión.
