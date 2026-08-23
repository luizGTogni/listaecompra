import { FastifyInstance } from 'fastify'
import { healthRoutes } from './health.js'

export async function appRoutes(app: FastifyInstance) {
  app.register(healthRoutes)
}
