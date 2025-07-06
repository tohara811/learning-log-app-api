import { Context } from 'hono'
import { jwtVerify } from 'jose'

const AUTH_SECRET = 'your-nextauth-secret' // NextAuth.jsと同じSECRET（環境変数から読み込んでもOK）

export async function getUserIdFromSession(c: Context): Promise<string | null> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  try {
    const secret = new TextEncoder().encode(AUTH_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // NextAuth の JWT payload に含まれる id または sub を使う（subがOAuth ID）
    const userId = typeof payload.sub === 'string' ? payload.sub : null

    return userId
  } catch (err) {
    console.error('Invalid JWT', err)
    return null
  }
}
