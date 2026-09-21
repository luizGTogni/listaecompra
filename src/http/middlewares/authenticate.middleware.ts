import { TokenDriver } from '@/drivers/auth/token.driver.js'
import { FastifyRequest } from 'fastify'
import { SESSION_COOKIE_NAME } from '../utils/session-cookie.js'
import { UnauthorizedError } from '../types/errors/unauthorized.error.js'

function getToken(request: FastifyRequest) {
  const cookieToken = request.cookies[SESSION_COOKIE_NAME]

  if (cookieToken) {
    return cookieToken
  }

  const [, bearerToken] = request.headers.authorization?.split(' ') ?? []

  return bearerToken
}

export function makeAuthenticate(tokenDriver: TokenDriver) {
  return async function authenticate(request: FastifyRequest) {
    const token = getToken(request)

    if (!token) {
      throw new UnauthorizedError()
    }

    const decoded = tokenDriver.verify(token)

    if (!decoded) {
      throw new UnauthorizedError()
    }

    request.user = { sub: decoded.user.sub }
  }
}
