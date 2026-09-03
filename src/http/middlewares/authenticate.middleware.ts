import { TokenDriver } from '@/drivers/auth/token.driver.js'
import { FastifyRequest } from 'fastify'
import { UnauthorizedError } from '../types/errors/unauthorized.error.js'

export function makeAuthenticate(tokenDriver: TokenDriver) {
  return async function authenticate(request: FastifyRequest) {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedError()
    }

    const [, token] = authHeader.split(' ')

    const decoded = tokenDriver.verify(token)

    if (!decoded) {
      throw new UnauthorizedError()
    }

    request.user = { sub: decoded.user.sub }
  }
}
