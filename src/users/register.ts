import { Hono } from 'hono'
import { z } from 'zod'
import { Env } from '../types'
import { hashSync } from 'bcryptjs'

const app = new Hono<{ Bindings: Env }>()

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6)
})

app.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Invalid request', details: parsed.error }, 400)
  }

  const { email, name, password } = parsed.data

  // メールアドレス重複チェック
  const existing = await c.env.DB.prepare(
    'SELECT id FROM users WHERE email = ?'
  ).bind(email).first()

  if (existing) {
    return c.json({ error: 'Email already registered' }, 409)
  }

  const password_hash = hashSync(password, 10)
  const id = crypto.randomUUID()

  await c.env.DB.prepare(`
    INSERT INTO users (id, name, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).bind(id, name, email, password_hash).run()

  return c.json({ message: 'User registered successfully' }, 201)
})

export default app
