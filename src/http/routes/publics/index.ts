import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.js'
import { publicUsersRoutes } from './user.js'

export function publicRoutes(app: FastifyInstance) {
  app.register(healthRoutes)
  app.register(publicUsersRoutes)
}
