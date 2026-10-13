# SM-Xplore — Frontend

Aplicación web del proyecto **SM-Xplore**, construida con **React 19**, **TypeScript** y **Vite**.

## Requisitos previos

- [Node.js](https://nodejs.org/) 20.19 o superior (se recomienda la versión LTS más reciente).
- npm 10 o superior (incluido con Node.js).

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. (Opcional) Crear el archivo de variables de entorno
cp .env.example .env

# 3. Levantar el servidor de desarrollo
npm run dev
```

El servidor de desarrollo queda disponible en <http://localhost:5173>.

## Scripts disponibles

| Script              | Descripción                                                    |
| ------------------- | -------------------------------------------------------------- |
| `npm run dev`       | Levanta el servidor de desarrollo con recarga en caliente (HMR). |
| `npm run build`     | Verifica los tipos y genera la build de producción en `dist/`.  |
| `npm run preview`   | Sirve localmente la build de producción.                        |
| `npm run typecheck` | Ejecuta únicamente la verificación de tipos (`tsc -b`).          |
| `npm run lint`      | Analiza el código con [Oxlint](https://oxc.rs/).                 |

## Estructura del proyecto

```text
SM-Xplore-front/
├─ public/                  # Recursos estáticos servidos tal cual (favicon, etc.)
├─ src/
│  ├─ assets/               # Recursos importados desde el código (imágenes, fuentes, ...)
│  ├─ components/           # Componentes reutilizables de UI
│  │  └─ Button/            # Cada componente vive en su carpeta con sus estilos
│  ├─ hooks/                # Hooks personalizados de React
│  ├─ pages/                # Vistas o páginas de la aplicación
│  ├─ services/             # Comunicación con APIs externas
│  ├─ types/                # Tipos e interfaces compartidas (+ tipado de variables de entorno)
│  ├─ utils/                # Funciones auxiliares puras
│  ├─ App.tsx               # Componente raíz
│  ├─ index.css             # Estilos globales y variables de tema
│  └─ main.tsx              # Punto de entrada de la aplicación
├─ .env.example             # Plantilla de variables de entorno
├─ index.html               # HTML base de la SPA
├─ tsconfig.app.json        # Configuración de TypeScript para el código de `src`
├─ tsconfig.node.json       # Configuración de TypeScript para las herramientas de build
└─ vite.config.ts           # Configuración de Vite
```

## Convenciones

- **Alias de rutas:** el prefijo `@` apunta a `src/`, tanto en Vite como en TypeScript:

  ```ts
  import { Button } from '@/components/Button'
  import { httpClient } from '@/services/httpClient'
  ```

- **Componentes:** cada componente tiene su propia carpeta dentro de `src/components` con el
  componente (`.tsx`), sus estilos (`.module.css`) y un `index.ts` que expone la API pública.
  Los estilos se escriben con **CSS Modules** para evitar colisiones de clases.

- **Variables de entorno:** deben empezar con `VITE_` para estar disponibles en el cliente y se
  consumen con `import.meta.env`. Su tipado se declara en `src/types/env.d.ts`. Nunca se suben
  secretos al repositorio.

- **Orden de imports:** primero paquetes externos, luego módulos internos con el alias `@/` y
  finalmente rutas relativas y hojas de estilo.

## Herramientas de calidad

- **TypeScript** en modo estricto, con `noUnusedLocals` y `noUnusedParameters` activados.
- **Oxlint** como linter (`npm run lint`), configurado en `.oxlintrc.json`. Para ver los avisos
  directamente en el editor se recomienda la extensión
  [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode).

## Enlaces útiles

- [Documentación de React](https://react.dev/)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Vite](https://vite.dev/)
