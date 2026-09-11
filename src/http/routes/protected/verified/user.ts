import { changePasswordController } from '@/http/controllers/users/change-password.controller.js'
import { withAuth } from '@/http/schemas/auth/with-auth.schema.js'
import {
  changePasswordBodySchema,
  changePasswordResponseSchema
} from '@/http/schemas/users/change-password.schema.js'
import { FastifyInstance } from 'fastify'

export async function verifiedUserRoutes(app: FastifyInstance) {
  app.patch(
    '/users/password/change',
    {
      schema: withAuth({
        tags: ['Users'],
        summary: 'Change password',
        description: 'change a user password.',
        body: changePasswordBodySchema,
        response: changePasswordResponseSchema
      })
    },
    changePasswordController
  )
}
