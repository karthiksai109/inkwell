import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const url = (p) => fileURLToPath(new URL(p, import.meta.url))
const svg = readFileSync(url('../public/icon.svg'))

for (const size of [192, 512]) {
  await sharp(svg, { density: 300 })
    .resize(size, size)
    .png()
    .toFile(url(`../public/pwa-${size}.png`))
  console.log(`generated pwa-${size}.png`)
}
