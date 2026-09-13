import { UserRepository } from '@/repositories/user.repository.js'
import { FastifyRequest } from 'fastify'
import { userAuthSchema } from '../schemas/auth/user-auth.schema.js'
import { ResourceNotFoundError } from '../types/errors/resource-not-found.error.js'
import { UserNotVerifiedError } from '../types/errors/user-not-verified.error.js'

export function makeRequireVerified(userRepository: UserRepository) {
  return async function requireVerified(request: FastifyRequest) {
    const { sub } = userAuthSchema.parse(request.user)

    const user = await userRepository.findById(sub)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!user.verifiedAt) {
      throw new UserNotVerifiedError()
    }
  }
}
