import { env } from '@/config/env.js'
import { FastifyReply } from 'fastify'

export const SESSION_COOKIE_NAME = 'token'

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

const sessionCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // 'none' é obrigatório quando front e back ficam em domínios
  // diferentes (produção), senão o navegador não envia o cookie em
  // chamadas fetch/XHR entre origens. 'none' exige secure: true, que já
  // está ligado em produção. Em dev, 'lax' basta (mesmo domínio,
  // localhost em portas diferentes).
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
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
