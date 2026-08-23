import { FastifyInstance } from 'fastify'
import { healthController } from '../controllers/health.controller.js'
import { healthResponseSchema } from '../schemas/health/health.schema.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Check if the API is up and running.',
        response: healthResponseSchema
      }
    },
    healthController
  )
}
