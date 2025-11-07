import { SignJWT, jwtVerify } from "jose"

export const SESSION_COOKIE_NAME = "briax_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const encoder = new TextEncoder()
const secret = process.env.AUTH_SECRET || "dev-secret"

function getSecretKey() {
  return encoder.encode(secret)
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<{ userId?: string }>(token, getSecretKey())
    if (!payload.userId) return null
    return { userId: payload.userId }
  } catch (error) {
    return null
  }
}
