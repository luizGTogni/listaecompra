import { forgotPasswordController } from '@/http/controllers/users/forgot-password.controller.js'
import { resetPasswordController } from '@/http/controllers/users/reset-password.controller.js'
import {
  forgotPasswordBodySchema,
  forgotPasswordResponseSchema
} from '@/http/schemas/users/forgot-password.schema.js'
import {
  resetPasswordBodySchema,
  resetPasswordResponseSchema
} from '@/http/schemas/users/reset-password.schema.js'
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
    '/password/forgot',
    {
      schema: {
        tags: ['Users', 'Password'],
        summary: 'Forgot password',
        description: 'Send code forgot password email.',
        body: forgotPasswordBodySchema,
        response: forgotPasswordResponseSchema
      }
    },
    forgotPasswordController
  )

  app.post(
    '/password/reset',
    {
      schema: {
        tags: ['Users', 'Password'],
        summary: 'Reset password',
        description: 'Reset a user password.',
        body: resetPasswordBodySchema,
        response: resetPasswordResponseSchema
      }
    },
    resetPasswordController
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
