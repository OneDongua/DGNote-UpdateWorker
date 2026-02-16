import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken, verifyToken } from "../utils/jwt"
import { authMiddleware } from "../middlewares/auth"

const auth = new Hono<{ Bindings: Env }>()

// 注册
auth.post("/register", async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: "Missing fields" }, 400)
  }

  const hashed = await hashPassword(password)

  try {
    await c.env.DB.prepare(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
    )
      .bind(username, hashed, "user")
      .run()
  } catch {
    return c.json({ error: "User exists" }, 400)
  }

  return c.json({ message: "Registered" })
})

// 登录
auth.post("/login", async (c) => {
  const { username, password } = await c.req.json()

  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE username = ?"
  )
    .bind(username)
    .first()

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  const valid = await comparePassword(password, user.password)

  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401)
  }

  const token = await generateToken(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    c.env.JWT_SECRET
  )

  setCookie(c, "token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
    maxAge: 60 * 60 * 2
  })

  return c.json({ message: "Logged in" })
})

// 登出
auth.post("/logout", async (c) => {
  setCookie(c, "token", "", {
    maxAge: 0,
    path: "/"
  })

  return c.json({ message: "Logged out" })
})

// 获取当前用户信息
auth.get("/me", async (c) => {
  const token = getCookie(c, "token")

  if (!token) {
    return c.json({ authenticated: false })
  }

  try {
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const user = await c.env.DB.prepare(
      "SELECT id, username, role FROM users WHERE id = ?"
    )
      .bind(payload.sub)
      .first()

    if (!user) {
      return c.json({ authenticated: false })
    }

    return c.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    })

  } catch (err) {
    return c.json({ authenticated: false })
  }
})

export default auth
