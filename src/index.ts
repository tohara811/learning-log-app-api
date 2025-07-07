import { Hono } from 'hono'
import { cors } from 'hono/cors';
import logs from './logs'
import register from './users/register'
import login from './users/login'
import me from './me'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: 'https://learning-log-app.pages.dev',
    credentials: true,
  })
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/logs', logs)
app.route('/users', register)
app.route('/users', login)
app.route('/me', me)

export default app
