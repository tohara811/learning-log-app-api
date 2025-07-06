import type { D1Database } from '@cloudflare/workers-types'

export type Env = {
  AI: any
  DB: D1Database
  AUTH_SECRET: string
}
