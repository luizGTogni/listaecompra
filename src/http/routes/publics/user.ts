import { FastifyInstance } from 'fastify'
import { authController } from '../../controllers/users/auth.controller.js'
import { createUserController } from '../../controllers/users/create-user.controller.js'
import {
  authBodySchema,
  authResponseSchema
} from '../../schemas/users/auth.schema.js'
import {
  createUserBodySchema,
  createUserResponseSchema
} from '../../schemas/users/create-user.schema.js'

export async function publicUsersRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Create user',
        description:
          'Creates a new user account. Username and email must be unique.',
        body: createUserBodySchema,
        response: createUserResponseSchema
      }
    },
    createUserController
  )

  app.post(
    '/session',
    {
      schema: {
        tags: ['Users', 'Auth'],
        summary: 'Auth user',
        description: 'authenticate a user account.',
        body: authBodySchema,
        response: authResponseSchema
      }
    },
    authController
  )
}
