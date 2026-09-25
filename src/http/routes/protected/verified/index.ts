import { FastifyInstance } from 'fastify'
import { verifiedAiRoutes } from './ai.js'
import { verifiedShopperRoutes } from './shopper.js'
import { verifiedUserRoutes } from './user.js'

export async function verifiedRoutes(app: FastifyInstance) {
  app.register(verifiedAiRoutes)
  app.register(verifiedShopperRoutes)
  app.register(verifiedUserRoutes)
}
