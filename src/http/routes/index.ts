import { JwtTokenDriver } from '@/drivers/auth/jwt-token.driver.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { FastifyInstance } from 'fastify'
import { makeAuthenticate } from '../middlewares/authenticate.middleware.js'
import { makeRequireVerified } from '../middlewares/require-verified.middleware.js'
import { authRoutes } from './protected/index.js'
import { publicRoutes } from './publics/index.js'

const tokenDriver = new JwtTokenDriver()
const authenticate = makeAuthenticate(tokenDriver)

const requireVerified = makeRequireVerified(inMemoryUserRepository)

export async function appRoutes(app: FastifyInstance) {
  app.register(publicRoutes)

  app.register(async (authApp) => {
    authApp.addHook('onRequest', authenticate)
    authApp.register(authRoutes)

    authApp.register(async (verifiedApp) => {
      verifiedApp.addHook('onRequest', requireVerified)

      // SEM ROTA AINDA VERIFICADA
    })
  })
}
