import { Hono } from 'hono'
import { cors } from 'hono/cors'

import update from './routes/update';
import auth from './routes/auth';
import admin from './routes/admin';
import { adminOnlyMiddleware, authMiddleware } from './middlewares/auth';
import manageHtml from './pages/manage.html'
import loginHtml from './pages/login.html'

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors())

app.use(
  "/admin/*",
  authMiddleware,
  adminOnlyMiddleware
)

app.route("/auth", auth)

app.get("/manage", async (c) => {
  return c.html(manageHtml);
})

app.get("/login", async (c) => {
  return c.html(loginHtml);
})

app.route("/admin", admin)

app.route("/update", update)

// 旧版支持
app.route("/dgnote-update", update)

export default app;
