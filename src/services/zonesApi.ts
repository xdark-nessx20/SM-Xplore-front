import type { Zone, ZoneInput } from '@/types'

/**
 * ⚠️ PUNTO ÚNICO DE INTERCAMBIO — módulo de sitios y zonas.
 *
 * El backend todavía NO tiene API de sitios ni de zonas (solo existen
 * `domain/model/site/Site.java`, `domain/model/zone/Zone.java` y los puertos de
 * repositorio). Estas vistas están diseñadas según Figma y funcionan hoy contra
 * un almacén local con los datos del mockup, para que queden montadas y
 * navegables.
 *
 * Cuando el backend implemente el módulo, basta con reemplazar los cuerpos de
 * este archivo por llamadas a `httpClient`, por ejemplo:
 *
 *   list:   () => httpClient.get<Zone[]>('/zones')
 *   create: (input) => httpClient.post<Zone>('/zones', input)
 *   update: (id, input) => httpClient.put<Zone>(`/zones/${id}`, input)
 *
 * Los campos que el backend deberá devolver son los de `src/types/zone.ts`
 * (ver `docs/pendientes-backend.md`, sección 2.1): capacidad recomendada,
 * umbral de congestión, sitios incluidos, delimitación, estado y la ocupación
 * actual que alimenta la barra de afluencia.
 */

const STORAGE_KEY = 'sm-xplore:zones-demo'

/** Datos de ejemplo tomados del wireframe «Zonas turísticas». */
const SEED: Zone[] = [
  {
    id: 'z-centro-historico',
    name: 'Centro Histórico',
    description: 'Casco antiguo: patrimonio, museos y vida nocturna.',
    recommendedCapacity: 1500,
    congestionThreshold: 80,
    sites: [
      { id: 's-catedral', name: 'Catedral' },
      { id: 's-parque-novios', name: 'Parque de los Novios' },
      { id: 's-quinta', name: 'Quinta de San Pedro' },
    ],
    boundary: null,
    status: 'CONGESTED',
    currentOccupancy: 85,
  },
  {
    id: 'z-rodadero',
    name: 'Rodadero',
    description: 'Franja hotelera y playa urbana.',
    recommendedCapacity: 2000,
    congestionThreshold: 80,
    sites: [
      { id: 's-playa-rodadero', name: 'Playa del Rodadero' },
      { id: 's-muelle', name: 'Muelle turístico' },
    ],
    boundary: null,
    status: 'NORMAL',
    currentOccupancy: 55,
  },
  {
    id: 'z-taganga',
    name: 'Taganga',
    description: 'Caleta de pescadores y buceo.',
    recommendedCapacity: 800,
    congestionThreshold: 75,
    sites: [
      { id: 's-bahia-taganga', name: 'Bahía de Taganga' },
      { id: 's-mirador', name: 'Mirador' },
    ],
    boundary: null,
    status: 'NORMAL',
    currentOccupancy: 40,
  },
  {
    id: 'z-minca',
    name: 'Minca',
    description: 'Sierra, café y senderos.',
    recommendedCapacity: 600,
    congestionThreshold: 70,
    sites: [{ id: 's-sendero-minca', name: 'Sendero Minca Verde' }],
    boundary: null,
    status: 'NORMAL',
    currentOccupancy: 25,
  },
]

function read(): Zone[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === null) {
      write(SEED)
      return SEED
    }

    return JSON.parse(stored) as Zone[]
  } catch {
    return SEED
  }
}

function write(zones: Zone[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
  } catch {
    // Sin almacenamiento disponible: la vista funciona solo en memoria.
  }
}

/** El estado se deriva del umbral, como indica el diseño. */
function withStatus(zone: Zone): Zone {
  return {
    ...zone,
    status:
      zone.currentOccupancy >= zone.congestionThreshold ? 'CONGESTED' : 'NORMAL',
  }
}

export const zonesApi = {
  list: async (): Promise<Zone[]> => read().map(withStatus),

  getById: async (id: string): Promise<Zone> => {
    const found = read().find((zone) => zone.id === id)

    if (found === undefined) {
      throw new Error('No se encontró la zona.')
    }

    return withStatus(found)
  },

  create: async (input: ZoneInput): Promise<Zone> => {
    const created = withStatus({
      ...input,
      id: `z-${Date.now()}`,
      currentOccupancy: 0,
    })

    write([...read(), created])
    return created
  },

  update: async (id: string, input: ZoneInput): Promise<Zone> => {
    const zones = read().map((zone) =>
      zone.id === id ? withStatus({ ...zone, ...input }) : zone,
    )

    write(zones)
    return withStatus(zones.find((zone) => zone.id === id) as Zone)
  },
}
