/**
 * Writes dist/_redirects at build time.
 *
 * The proxy target is read from the API_ORIGIN environment variable rather than
 * committed, so the Pi's address lives in the netlify site settings and never
 * lands in a public repo. Set it under Site configuration > Environment
 * variables, e.g. API_ORIGIN=http://203.0.113.10:2137
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const SPA_FALLBACK = '/*    /index.html    200'

const origin = process.env.API_ORIGIN?.trim().replace(/\/+$/, '')

if (!origin) {
  //failing the build beats shipping a site whose every request 404s
  console.error(
    'API_ORIGIN is not set - the frontend would have no backend to call.\n' +
      'Set it in the netlify site settings, e.g. http://203.0.113.10:2137'
  )
  process.exit(1)
}

const rules = [`/api/*    ${origin}/:splat    200`, SPA_FALLBACK]
writeFileSync(join(DIST, '_redirects'), `${rules.join('\n')}\n`)
console.log(`_redirects written, /api proxied to ${origin}`)
