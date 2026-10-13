# SM-Xplore — Frontend

Aplicación web del proyecto **SM-Xplore**, construida con **React 19**, **TypeScript** y **Vite**.
Consume la API REST del backend [`SM-Xplore-Proto`](https://github.com/xdark-nessx20/SM-Xplore-Proto)
(Spring Boot / WebFlux) bajo el prefijo `/api/v1`.

## Requisitos previos

- [Node.js](https://nodejs.org/) 20.19 o superior (se recomienda la versión LTS más reciente).
- npm 10 o superior (incluido con Node.js).
- Docker, solo si vas a levantar el backend en local.

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Crear el archivo de variables de entorno
cp .env.example .env

# 3. Levantar el servidor de desarrollo
npm run dev
```

El frontend queda en <http://localhost:5173>.

### Backend en local

```bash
cd ../SM-Xplore-Proto

# Bases de datos (Postgres local suele ocupar 5432, por eso 5433)
POSTGRES_PORT=5433 docker compose up -d mongodb postgres

# Aplicación
./gradlew bootRun
```

El backend queda en <http://localhost:8080> con Swagger en
<http://localhost:8080/swagger-ui.html>.

## Scripts disponibles

| Script              | Descripción                                                     |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo con recarga en caliente (HMR).           |
| `npm run build`     | Verifica los tipos y genera la build de producción en `dist/`.   |
| `npm run preview`   | Sirve localmente la build de producción.                        |
| `npm run typecheck` | Verifica tipos con `tsc -b`.                                    |
| `npm run lint`      | Analiza el código con [Oxlint](https://oxc.rs/).                 |

## Proxy de desarrollo y CORS

El backend **todavía no expone configuración CORS**, así que el navegador bloquearía las
peticiones a otro origen. Para evitarlo, Vite reenvía `/api` y `/actuator` a
`http://localhost:8080` (ver `vite.config.ts`). Puedes cambiar el destino con la variable
`BACKEND_URL` en el `.env`.

Cuando el backend agregue CORS, basta con apuntar `VITE_API_URL` a la URL absoluta del backend.

## Diseño (Figma)

El diseño vive en el archivo de Figma **WireFrames** y está sincronizado en `docs/wireframes/`:

- **53 pantallas** exportadas como PNG (16 mockups de alta fidelidad de Actividades, Eventos y
  Reseñas; 37 wireframes del resto de módulos).
- `design-tokens.json` con la paleta y los estilos de texto reales del archivo.

Para actualizarlas:

```bash
npm run figma:sync -- --file "https://www.figma.com/design/<KEY>/<slug>"
```

El token (scope *File content: read-only*) se guarda en `~/.figma-token`, **fuera del
repositorio**.

### Tokens

Los valores de abajo alimentan `src/index.css` y son la fuente de verdad visual del proyecto.

| Token                   | Valor      | Uso                                                        |
| ----------------------- | ---------- | ---------------------------------------------------------- |
| `--color-primary`       | `#0E8C8A`  | teal de marca: logo "Xplore", chips, acciones (Aplicar, Publicar) |
| `--color-ink`           | `#12212B`  | navy: barras, menú lateral y botón principal de login      |
| `--color-primary-soft`  | `#DDF3EC`  | fondo del cargador de imágenes                             |
| `--color-text`          | `#111827`  | texto principal                                            |
| `--color-muted`         | `#6B7280`  | texto secundario y metadatos                               |
| `--color-surface`       | `#F4F5F7`  | fondo de página                                            |
| `--color-border`        | `#E5E7EB`  | bordes de tarjetas e inputs                                |

Estados de las etiquetas: `--color-success-*` (Confirmada), `--color-warning-*` (Pendiente) y
`--color-danger-*` (Cancelada / errores).

### Tipografías

Se cargan desde Google Fonts en `index.html`:

- `--font-display` — **DM Serif Display**: título del catálogo ("Actividades turísticas en Santa Marta").
- `--font-heading` — **Manrope**: títulos de pantalla, botones, etiquetas y menús.
- `--font-sans` — **Inter**: cuerpo de texto e inputs.

## Estructura del proyecto

```text
SM-Xplore-front/
├─ docs/wireframes/         # Pantallas exportadas de Figma + design-tokens.json
├─ public/                  # Recursos estáticos servidos tal cual (favicon, etc.)
├─ scripts/figma-sync.mjs   # Descarga frames y tokens desde la API de Figma
├─ src/
│  ├─ assets/               # Recursos importados desde el código
│  ├─ components/           # Button, Chip, Footer, FormField, Logo, Placeholder, TopBar
│  ├─ config/               # Roles, secciones del panel y navegación pública
│  ├─ context/              # Sesión: AuthContext + AuthProvider
│  ├─ hooks/                # useAuth, useLocalStorage
│  ├─ layouts/              # PublicLayout (catálogo) y AppLayout (panel con menú lateral)
│  ├─ pages/                # Pantallas (auth/ para login y registro)
│  ├─ routes/               # Router y guardas RequireAuth / RequireRole
│  ├─ services/             # httpClient + un módulo por dominio del backend
│  ├─ types/                # Tipos por dominio (contrato del backend) + env.d.ts
│  ├─ utils/                # Funciones auxiliares puras
│  ├─ App.tsx               # Proveedores + router
│  ├─ index.css             # Tokens de diseño (paleta y tipografías de Figma)
│  └─ main.tsx              # Punto de entrada
├─ .env.example             # Plantilla de variables de entorno
├─ index.html               # HTML base de la SPA
├─ tsconfig.app.json        # TypeScript del código de `src`
├─ tsconfig.node.json       # TypeScript de las herramientas de build
└─ vite.config.ts           # Vite + alias `@` + proxy al backend
```

## Rutas y roles

Las secciones del menú se definen en `src/config/navigation.ts` y el router las convierte en
rutas protegidas automáticamente.

| Ruta                      | Pantalla              | Roles                              |
| ------------------------- | --------------------- | ---------------------------------- |
| `/login`                  | Iniciar sesión        | público                            |
| `/registro`               | Crear cuenta          | público                            |
| `/app`                    | Panel inicial         | todos                              |
| `/app/explorar`           | Explorar              | TOURIST                            |
| `/app/mis-reservas`       | Mis reservas          | TOURIST                            |
| `/app/mis-actividades`    | Mis actividades       | GUIDE                              |
| `/app/mis-servicios`      | Mis servicios         | SERVICE_PROVIDER                   |
| `/app/reservas-recibidas` | Reservas recibidas    | GUIDE, SERVICE_PROVIDER            |
| `/app/sitios`             | Destinos y sitios     | DESTINATION_MANAGER                |
| `/app/eventos`            | Eventos               | DESTINATION_MANAGER, ADMIN         |
| `/app/actividades`        | Actividades           | ADMIN                              |
| `/app/servicios`          | Servicios             | ADMIN                              |
| `/app/usuarios`           | Usuarios              | ADMIN                              |
| `/app/reportes`           | Reportes de seguridad | todos                              |
| `/app/perfil`             | Mi perfil             | todos                              |

> Las pantallas de sección son provisionales (`Placeholder`) hasta implementar los wireframes
> de Figma.

## Autenticación (limitaciones del prototipo)

- El backend **no emite tokens**: `POST /api/v1/auth/login` devuelve el usuario y nada más. La
  sesión se guarda en `localStorage` (`sm-xplore:user`) mediante `AuthProvider`. **No es
  autenticación real**: sirve para el prototipo y para la demo.
- Por eso mismo, los endpoints de administrador **no validan permisos en el servidor**; el
  control de acceso aquí es solo de interfaz (`RequireAuth` / `RequireRole`).
- Las **prestadoras de servicios** se registran en estado `INACTIVE` y no pueden iniciar sesión
  hasta que un administrador las apruebe; el formulario de registro lo advierte.

## Capa de API

`src/services/httpClient.ts` es un envoltorio de `fetch` que:

- resuelve la URL base desde `VITE_API_URL` (por defecto `/api/v1`);
- serializa el cuerpo a JSON y omite los parámetros de query vacíos;
- devuelve `undefined` en respuestas `204`;
- lanza `ApiError` (con `status` y el `ApiErrorResponse` del backend) o `TypeError` si no hay
  conexión.

Cada dominio del backend tiene su módulo tipado:

| Módulo                       | Endpoints                                                       |
| ---------------------------- | --------------------------------------------------------------- |
| `services/authApi.ts`        | `/auth/login`, `/auth/register`, `/auth/recover-password`        |
| `services/usersApi.ts`       | `/users/**` (perfil, roles, bloqueo, perfiles de guía/proveedor) |
| `services/eventsApi.ts`      | `/events/**`                                                     |
| `services/servicesApi.ts`    | `/services/**` (servicios turísticos de las prestadoras)         |
| `services/activitiesApi.ts`  | `/activities/**`                                                 |
| `services/reservationsApi.ts`| `/reservations/**` y `/reservation-items/**`                     |
| `services/securityReportsApi.ts` | `/security-reports/**` (incluye comentarios y fotos)         |

```ts
import { eventsApi } from '@/services/eventsApi'

const eventos = await eventsApi.list()
const publicados = await eventsApi.changeStatus(evento.id, { status: 'PUBLISHED' })
```

Los tipos viven en `src/types/<dominio>.ts` y reflejan el contrato del backend: enums en
mayúsculas (`DRAFT`, `PENDING`, …), fechas ISO-8601, `price`/`total` como número y campos
opcionales enviados solo cuando aplican.

## Convenciones

- **Alias de rutas:** `@` apunta a `src/` (Vite y TypeScript).
- **Componentes:** una carpeta por componente en `src/components` con `.tsx`, `.module.css` e
  `index.ts`. Estilos siempre con **CSS Modules**.
- **Variables de entorno:** prefijo `VITE_`; su tipado se declara en `src/types/env.d.ts`.
- **Orden de imports:** paquetes externos → alias `@/` → rutas relativas y estilos.

### Agregar una sección nueva

1. Añade el ítem en `src/config/navigation.ts` (ruta, etiqueta, descripción y roles).
2. El router crea la ruta protegida automáticamente.
3. Cuando exista el diseño, reemplaza el `Placeholder` por una pantalla real en `src/pages`.

## Estado actual y pendientes

- [x] Scaffolding React + TypeScript + Vite, alias, lint y estilos base.
- [x] Capa de API tipada por dominio + proxy de desarrollo.
- [x] Router con login, registro, sesión y menú por rol.
- [x] Tokens de diseño y componentes base a partir de Figma (paleta, tipografías, shell público).
- [x] Módulo **Usuarios** (admin): listado con búsqueda, filtros por rol, orden, paginación y
      badges; detalle de usuario con asignación de rol, bloqueo, suspensión, restablecimiento de
      contraseña y retiro de admin; pantalla de aprobación de prestadoras (UC6).
- [x] **Perfiles**: mi perfil con edición (UC3), perfil público de guía (UC4) y de prestadora
      (UC5), estos dos últimos con datos reales de `/users/guides`, `/users/providers`,
      `/activities` y `/services/provider`.
- [x] **Catálogo del turista**: Explorar con filtros por categoría, fecha y precio, orden y
      paginación (mockups 06-UC2/UC7/UC8) y detalle de actividad con panel de reserva conectado a
      `POST /reservations` + ítems (mockup 06-UC9). La barra del catálogo es la variante navy.
- [x] **Mis reservas** (turista): listado con filtros por estado, badges de fecha y estado,
      nombres de ítem resueltos desde los catálogos, y detalle con información, prestadora o guía,
      desglose de pago y solicitud de cancelación (wireframes 10). El turista ya usa el shell
      público: sus rutas son `/explorar`, `/mis-reservas`, `/perfil` y `/reportes`.
- [x] **Reservas recibidas** (prestadora y guía): listado con búsqueda, filtros por estado y
      acciones de confirmar, rechazar, marcar asistencia, no-show y cancelar; detalle con contacto
      del turista e ítems.
- [x] **Crear itinerario** (turista): plan por días guardado en el navegador, reserva por
      elemento y "Reservar pendientes" agrupando por tipo y prestadora (el dominio no permite
      mezclar tipos ni proveedores en una misma reserva).
- [x] **Autenticación con JWT**: login con `AuthResponse`, token en `Authorization`, cierre de
      sesión automático al 401, registro limitado a Turista y Prestadora.
- [x] **Actividades del guía**: listado, registrar (UC1), editar con estados (UC3) y
      disponibilidad/cupos (UC4/UC5/UC6), con las limitaciones del backend señaladas en pantalla.
- [x] **Eventos**: agenda pública con filtros y detalle con reserva (turista) y gestión con estados
      y afluencia esperada (gestora).
- [x] **Servicios de la prestadora**: listado, registrar (tipo, precio, ubicación, fotos por URL y
      atributos extra) y gestionar precio, disponibilidad, fotos y atributos. Sin mockup en Figma:
      se siguió el sistema de diseño del panel.
- [ ] Implementar el resto de módulos: Actividades, Eventos, Reservas, Reseñas, Reportes de
      seguridad y Destinos.
- [ ] Conectar las pantallas a la API real (requiere backend funcionando).
- [ ] Separar el layout del turista: en los diseños usa la barra pública (catálogo), no el panel
      con menú lateral.
- [ ] Carga de imágenes (fotos de servicios y reportes) — el backend hoy recibe URLs.
- [ ] **Backend pendiente:** exponer por HTTP la aprobación de prestadoras; el caso de uso
      `ApproveServiceProviderRegistrationUseCase` ya existe y el dominio ya tiene
      `registrationStatus`, pero ninguna ruta lo invoca. Los botones "Aprobar/Rechazar" están
      deshabilitados por eso.
- [ ] **Backend pendiente:** almacenar los documentos de la solicitud de prestadora (cámara de
      comercio, RUT, certificado de seguridad) que el diseño pide validar.

> **Aviso sobre el backend (`develop`, commit `9ffd379`):** el merge del PR #6 dejó
> `GlobalExceptionHandler.java` sin compilar (anotaciones `@ExceptionHandler` apiladas) y
> `application.yaml` con claves duplicadas (`spring.r2dbc`, `spring.sql`), lo que impide
> arrancar la aplicación. Hay que repararlos antes de probar el frontend contra la API.

## Autenticación (JWT)

- `POST /api/v1/auth/login` devuelve `{ token, tokenType, expiresIn, user }`. El token viaja en
  `Authorization: Bearer <token>` y lo añade `src/services/httpClient.ts`; `src/services/authToken.ts`
  lo cachea junto al usuario en `localStorage`.
- **Todos** los endpoints salvo login, registro, recuperar contraseña, `/actuator/health` y Swagger
  exigen token. Al expirar (60 min) la API responde 401, `httpClient` avisa y `AuthProvider` cierra
  sesión.
- No hay refresh token ni logout en el servidor: la sesión es local hasta que expira el JWT.
- Solo **Turista** y **Prestadora** pueden auto-registrarse. Las prestadoras quedan `INACTIVE` y un
  admin las aprueba con `POST /api/v1/users/{id}/approve-provider`.
- El backend ya expone CORS (`CORS_ALLOWED_ORIGINS`, por defecto `http://localhost:*`), así que el
  proxy de Vite es opcional en desarrollo.

## Herramientas de calidad

- **TypeScript** estricto, con `noUnusedLocals` y `noUnusedParameters`.
- **Oxlint** (`npm run lint`), configuración en `.oxlintrc.json`. Para ver los avisos en el
  editor se recomienda la extensión
  [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode).

## Enlaces útiles

- [Documentación de React](https://react.dev/)
- [Documentación de React Router](https://reactrouter.com/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Vite](https://vite.dev/)
