import { Hono } from 'hono'
import { cors } from 'hono/cors'

import update from './routes/update';
import auth from './routes/auth';
import admin from './routes/admin';
import { authMiddleware } from './middlewares/auth';

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors())

app.use(
  "/admin/*",
  authMiddleware
)

app.route("/auth", auth)

app.route("/admin", admin)

app.route("/update", update)

// 旧版支持
app.route("/dgnote-update", update)

export default app;
