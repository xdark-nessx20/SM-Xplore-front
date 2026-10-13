#!/usr/bin/env node
/**
 * Sincroniza el archivo de Figma con el repositorio:
 *   1. Descarga cada frame de nivel superior como PNG en `docs/wireframes/`.
 *   2. Extrae colores sólidos y estilos de texto en `docs/wireframes/design-tokens.json`.
 *
 * Uso:
 *   FIGMA_FILE="https://www.figma.com/design/<KEY>/<slug>" node scripts/figma-sync.mjs
 *   node scripts/figma-sync.mjs --file <KEY|URL> --no-images
 *
 * El token se lee de la variable de entorno FIGMA_TOKEN o del archivo
 * ~/.figma-token (nunca se guarda en el repositorio).
 * Requiere un personal access token de Figma con scope "File content: read-only".
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

const API = 'https://api.figma.com/v1'
const OUTPUT_DIR = join(process.cwd(), 'docs', 'wireframes')
const MAX_FRAMES = 120
const RENDERABLE = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'GROUP'])

const HELP = `
Sincroniza frames y estilos desde Figma.

Opciones:
  --file <KEY|URL>   Archivo de Figma (o variable FIGMA_FILE)
  --no-images        No descargar PNGs, solo extraer estilos
  --no-tokens        No extraer estilos, solo descargar PNGs
  -h, --help         Muestra esta ayuda

Token: variable FIGMA_TOKEN o archivo ~/.figma-token
`

const { values, positionals } = parseArgs({
  options: {
    file: { type: 'string' },
    'no-images': { type: 'boolean', default: false },
    'no-tokens': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
})

async function resolveToken() {
  if (process.env.FIGMA_TOKEN) {
    return process.env.FIGMA_TOKEN.trim()
  }

  try {
    return (await readFile(join(homedir(), '.figma-token'), 'utf8')).trim()
  } catch {
    return null
  }
}

function parseFileInput(input) {
  const match = input.match(
    /figma\.com\/(?:design|file|board|proto)\/([A-Za-z0-9]+)/,
  )

  if (match) {
    let nodeId = null

    try {
      const raw = new URL(input).searchParams.get('node-id')
      if (raw) {
        nodeId = raw.replace('-', ':')
      }
    } catch {
      nodeId = null
    }

    return { key: match[1], nodeId }
  }

  return { key: input.trim(), nodeId: null }
}

function toHex({ r, g, b }, opacity = 1) {
  const channel = (value) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')

  const hex = `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
  return opacity < 1 ? `${hex} (${Math.round(opacity * 100)}%)` : hex
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function collectTokens(document) {
  const colors = new Map()
  const textStyles = new Map()

  function walk(node) {
    if (Array.isArray(node.fills)) {
      for (const fill of node.fills) {
        if (fill.visible === false) continue
        if (fill.type === 'SOLID' && fill.color) {
          const hex = toHex(fill.color, fill.opacity ?? 1)
          colors.set(hex, (colors.get(hex) ?? 0) + 1)
        }
      }
    }

    if (node.type === 'TEXT' && node.style) {
      const { fontFamily, fontWeight, fontSize, lineHeightPx } = node.style
      const label = `${fontFamily} · ${fontWeight} · ${fontSize}px / ${lineHeightPx ?? '?'}px`
      textStyles.set(label, (textStyles.get(label) ?? 0) + 1)
    }

    for (const child of node.children ?? []) {
      walk(child)
    }
  }

  walk(document)

  const sortByCount = (map) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, count }))

  return { colors: sortByCount(colors), textStyles: sortByCount(textStyles) }
}

async function figma(path, token) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'X-Figma-Token': token },
  })

  if (!response.ok) {
    const detail = await response.text()

    if (response.status === 403 || response.status === 401) {
      throw new Error(
        'Figma rechazó el token (401/403). Revisa que sea válido y con scope "File content: read-only".',
      )
    }

    if (response.status === 404) {
      throw new Error(
        'Figma no encontró el archivo o el nodo (404). Verifica la clave del archivo.',
      )
    }

    throw new Error(
      `Figma respondió ${response.status}: ${detail.slice(0, 300)}`,
    )
  }

  return response.json()
}

function collectTargets(pages) {
  const targets = []

  for (const page of pages) {
    for (const node of page.children ?? []) {
      // Las secciones agrupan pantallas: se exporta cada pantalla por separado.
      if (node.type === 'SECTION') {
        for (const child of node.children ?? []) {
          if (RENDERABLE.has(child.type)) {
            targets.push({
              page: page.name,
              section: node.name,
              id: child.id,
              name: child.name,
            })
          }
        }
        continue
      }

      if (RENDERABLE.has(node.type)) {
        targets.push({
          page: page.name,
          section: null,
          id: node.id,
          name: node.name,
        })
      }
    }
  }

  return targets.slice(0, MAX_FRAMES)
}

async function main() {
  if (values.help) {
    console.log(HELP.trim())
    return
  }

  const fileInput = values.file ?? process.env.FIGMA_FILE ?? positionals[0]

  if (!fileInput) {
    console.error(
      'Falta el archivo de Figma. Usa --file <KEY|URL> o la variable FIGMA_FILE.\n',
    )
    console.error(HELP.trim())
    process.exit(1)
  }

  const token = await resolveToken()

  if (!token) {
    console.error(
      [
        'No encontré el token de Figma.',
        '',
        'Crea un personal access token con scope "File content: read-only" en',
        'https://www.figma.com/settings y guárdalo así:',
        '',
        '  printf "%s" "<TU_TOKEN>" > ~/.figma-token && chmod 600 ~/.figma-token',
        '',
        'O pásalo en la variable de entorno FIGMA_TOKEN.',
      ].join('\n'),
    )
    process.exit(1)
  }

  const { key, nodeId } = parseFileInput(fileInput)
  const target = nodeId ? `${key}?node-id=${encodeURIComponent(nodeId)}` : key

  console.log(`Leyendo el archivo ${key}${nodeId ? ` (nodo ${nodeId})` : ''}…`)

  const file = await figma(`/files/${target}`, token)
  const document = file.document
  const pages = document.children ?? []

  const frames = collectTargets(pages)

  console.log(`\nNombre del archivo: ${file.name}`)
  console.log(`Última modificación: ${file.lastModified}\n`)
  console.log('Contenido encontrado:')

  for (const page of pages) {
    console.log(
      `  · ${page.name} (${(page.children ?? []).length} nodos de nivel superior)`,
    )

    for (const node of page.children ?? []) {
      if (node.type === 'SECTION') {
        console.log(
          `      ↳ sección "${node.name}": ${(node.children ?? []).length} pantallas`,
        )
      }
    }
  }

  console.log(`\nTotal de pantallas a exportar: ${frames.length}`)

  await mkdir(OUTPUT_DIR, { recursive: true })

  if (!values['no-images']) {
    console.log(`\nSolicitando ${frames.length} renders PNG…`)

    const { images } = await figma(
      `/images/${key}?ids=${frames.map((frame) => frame.id).join(',')}&format=png&scale=2`,
      token,
    )

    const usedNames = new Set()

    for (const frame of frames) {
      const url = images[frame.id]

      if (!url) {
        console.log(`  ✗ ${frame.name} (Figma no devolvió render)`)
        continue
      }

      const base = slugify(
        [frame.page, frame.section, frame.name].filter(Boolean).join('-'),
      )
      let filename = `${base}.png`

      if (usedNames.has(filename)) {
        filename = `${base}-${frame.id.replace(':', '-')}.png`
      }

      usedNames.add(filename)

      const response = await fetch(url)
      const buffer = Buffer.from(await response.arrayBuffer())
      await writeFile(join(OUTPUT_DIR, filename), buffer)
      console.log(`  ✓ ${filename}`)
    }
  }

  if (!values['no-tokens']) {
    const tokens = collectTokens(document)
    const output = {
      fileKey: key,
      fileName: file.name,
      lastModified: file.lastModified,
      generatedAt: new Date().toISOString(),
      frames: frames.map(({ page, section, name }) => ({
        page,
        section,
        name,
      })),
      ...tokens,
    }

    await writeFile(
      join(OUTPUT_DIR, 'design-tokens.json'),
      `${JSON.stringify(output, null, 2)}\n`,
    )

    console.log('\nColores más usados:')
    for (const { value, count } of tokens.colors.slice(0, 15)) {
      console.log(`  ${value}  ×${count}`)
    }

    console.log('\nEstilos de texto más usados:')
    for (const { value, count } of tokens.textStyles.slice(0, 8)) {
      console.log(`  ${value}  ×${count}`)
    }

    console.log('\nTokens escritos en docs/wireframes/design-tokens.json')
  }
}

main().catch((error) => {
  console.error(
    `\n✗ ${error instanceof Error ? error.message : String(error)}`,
  )
  process.exit(1)
})
