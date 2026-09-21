import { env } from '@/config/env.js'
import { FastifyReply } from 'fastify'

export const SESSION_COOKIE_NAME = 'token'

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
} as const

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE_NAME, token, {
    ...sessionCookieOptions,
    maxAge: SESSION_MAX_AGE_SECONDS
  })
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions)
}
