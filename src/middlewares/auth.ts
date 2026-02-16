import type { MiddlewareHandler } from "hono"
import { getCookie } from "hono/cookie"
import { verifyToken } from "../utils/jwt"
export const authMiddleware: MiddlewareHandler<{ Bindings: Env }> =
  async (c, next) => {
    const token = getCookie(c, "token")

    if (!token) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    try {
      const payload = await verifyToken(token, c.env.JWT_SECRET)
      c.set("user", payload)
      await next()
    } catch {
      return c.json({ error: "Invalid token" }, 401)
    }
  }

export const adminOnlyMiddleware: MiddlewareHandler<{ Bindings: Env }> =
  async (c, next) => {
  const user = c.get("user")

  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403)
  }

  await next()
}
