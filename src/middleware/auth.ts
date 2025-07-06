import { Context } from 'hono'
import { jwtVerify } from 'jose'
import type { Env } from '../types'

export async function getUserIdFromSession(c: Context<{ Bindings: Env }>): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  try {
    const secret = new TextEncoder().encode(c.env.AUTH_SECRET || 'your-secret-string')
    const { payload } = await jwtVerify(token, secret)

    // NextAuth の JWT payload に含まれる id または sub を使う（subがOAuth ID）
    const userId = typeof payload.sub === 'string' ? payload.sub : null

    return userId
  } catch (err) {
    console.error('Invalid JWT', err)
    return null
  }
}
