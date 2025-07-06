import { Hono } from 'hono'
import { z } from 'zod'
import { compare } from '@node-rs/bcrypt'
import { SignJWT } from 'jose'
import { Env } from '../types'

const app = new Hono<{ Bindings: Env }>()

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

const getJwtSecretKey = (env: Env): Uint8Array => {
  return new TextEncoder().encode(env.AUTH_SECRET || 'your-dev-secret')
}

app.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid login request' }, 400)
  }

  const { email, password } = parsed.data

  // ユーザー検索
  const user = await c.env.DB.prepare(
    'SELECT id, name, password_hash FROM users WHERE email = ?'
  ).bind(email).first()

  if (!user) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  // パスワード検証
  const ok = await compare(password, user.password_hash as string)
  if (!ok) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  // JWT発行
  const jwt = await new SignJWT({
    name: user.name,
    email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey(c.env))

  return c.json({ token: jwt })
})

export default app
