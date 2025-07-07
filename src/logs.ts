import { Hono } from 'hono'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { Ai } from '@cloudflare/ai'
import { getUserIdFromSession } from './middleware/auth'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

// バリデーションスキーマ
const bodySchema = z.object({
  date: z.string(), // 例: "2025-07-07"
  content: z.string().min(1),
  duration: z.number(),
  memo: z.string().optional()
})

// POST /api/logs
app.post('/', async (c) => {
  const userId = await getUserIdFromSession(c)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const body = await c.req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid request', details: parsed.error }, 400)

  const { date, content, duration, memo } = parsed.data

  // 過去ログを取得
  const past = await c.env.DB.prepare(
    'SELECT content FROM logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
  ).bind(userId).all()

  const history = past.results.map((r) => r.content).join('\n')

  const prompt = `
これまでの学習内容:
${history}

今回の学習内容:
${content}

ユーザーを励ます一言コメントを日本語で1文で生成してください。丁寧でやさしい口調でお願いします。
`

  const ai = new Ai(c.env.AI)
  const aiRes = await ai.run('@cf/meta/llama-3-8b-instruct', {
    prompt
  })

  const ai_comment = aiRes.response?.trim() ?? 'よくがんばりました！'

  const created_at = new Date().toISOString()

  // ログを保存
  await c.env.DB.prepare(`
    INSERT INTO logs (id, user_id, date, content, duration, memo, ai_comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    nanoid(),
    userId,
    date,
    content,
    duration,
    memo ?? '',
    ai_comment,
    created_at
  ).run()

  return c.json({
    message: '登録しました',
    ai_comment
  })
})

app.get('/', async (c) => {
  const userId = await getUserIdFromSession(c)
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const result = await c.env.DB.prepare(`
    SELECT id, date, content, duration, memo, ai_comment, created_at
    FROM logs
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT 50
  `).bind(userId).all()

  return c.json({
    logs: result.results
  })
})

export default app
