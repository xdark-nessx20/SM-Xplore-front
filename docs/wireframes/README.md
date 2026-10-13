# Wireframes y mockups

Aquí van las referencias de diseño que alimentan la implementación del frontend.

## Vía automática (recomendada)

Con un personal access token de Figma (`File content: read-only`) guardado en
`~/.figma-token`:

```bash
npm run figma:sync -- --file "https://www.figma.com/design/<KEY>/<slug>"
```

El script descarga cada frame como PNG en esta carpeta y escribe
`design-tokens.json` con los colores y estilos de texto más usados.

## Vía manual

Exporta los frames desde Figma (PNG, 2x) y déjalos aquí con un nombre
descriptivo, por ejemplo `turista-explorar.png`. Adjunta también los hex de la
paleta si los tienes a mano.
