import { UserRepository } from '@/repositories/user.repository.js'
import { FastifyRequest } from 'fastify'
import { ResourceNotFoundError } from '../types/errors/resource-not-found.error.js'
import { UserNotVerifiedError } from '../types/errors/user-not-verified.error.js'

export function makeRequireVerified(userRepository: UserRepository) {
  return async function requireVerified(request: FastifyRequest) {
    const user = await userRepository.findById(request.user.sub)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (!user.verifiedAt) {
      throw new UserNotVerifiedError()
    }
  }
}
