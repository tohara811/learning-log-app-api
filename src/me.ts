import { Hono } from 'hono'
import { getUserIdFromSession } from './middleware/auth'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.get('/', async (c) => {
  const userId = await getUserIdFromSession(c)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const result = await c.env.DB.prepare(`
    SELECT id, name, email FROM users WHERE id = ?
  `).bind(userId).first()

  if (!result) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user: result })
})

export default app
