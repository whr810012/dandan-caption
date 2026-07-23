import http from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { handleCaptionGen } from './handler'

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvLocal()

const PORT = Number(process.env.CAPTION_GEN_PORT ?? 8791)

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST' || !req.url?.includes('caption-gen')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not Found' }))
    return
  }

  try {
    const body = await readJson(req)
    const result = await handleCaptionGen(body, {
      arkApiKey: process.env.ARK_API_KEY,
      arkModel: process.env.ARK_MODEL,
      arkEndpoint: process.env.ARK_ENDPOINT,
    })
    res.writeHead(result.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result.body))
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'internal error' }))
  }
})

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用。caption-gen 可能已在运行。`)
    process.exit(1)
  }
  throw error
})

server.listen(PORT, () => {
  console.log(`Caption gen dev server: http://127.0.0.1:${PORT}/api/caption-gen`)
})

function readJson(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolvePromise, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolvePromise(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}
