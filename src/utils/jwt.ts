import { sign, verify } from "hono/jwt"

export async function generateToken(payload: any, secret: string) {
  return await sign(
    {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2 // 2小时
    },
    secret
  )
}

export async function verifyToken(token: string, secret: string) {
  return await verify(token, secret)
}
