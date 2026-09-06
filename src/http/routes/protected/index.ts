import { changePasswordController } from '@/http/controllers/users/change-password.controller.js'
import { resendCodeController } from '@/http/controllers/users/resend-code.controller.js'
import { verifyUserController } from '@/http/controllers/users/verify-user.controller.js'
import { withAuth } from '@/http/schemas/auth/with-auth.schema.js'
import {
  changePasswordBodySchema,
  changePasswordResponseSchema
} from '@/http/schemas/users/change-password.schema.js'
import { resendCodeResponseSchema } from '@/http/schemas/users/resend-code.schema.js'
import {
  verifyUserBodySchema,
  verifyUserResponseSchema
} from '@/http/schemas/users/verify-user.schema.js'
import { FastifyInstance } from 'fastify'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/users/verify',
    {
      schema: withAuth({
        tags: ['Users', 'Auth'],
        summary: 'Verify user',
        description: 'Verify a new user account.',
        body: verifyUserBodySchema,
        response: verifyUserResponseSchema
      })
    },
    verifyUserController
  )

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

  app.post(
    '/code/resend',
    {
      schema: withAuth({
        tags: ['Users', 'Auth', 'Code'],
        summary: 'Resend verification code',
        description:
          'Resend a new verification code to the authenticated user.',
        response: resendCodeResponseSchema
      })
    },
    resendCodeController
  )
}
