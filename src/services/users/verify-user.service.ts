import { CodeExpiredError } from '@/http/types/errors/code-expired.error.js'
import { CodeInvalidError } from '@/http/types/errors/code-invalid.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserAlreadyVerifiedError } from '@/http/types/errors/user-already-verified.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface VerifyUserRequest {
  userId: string
  codeValue: string
}

export class VerifyUserService {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository
  ) {}

  async execute({ userId, codeValue }: VerifyUserRequest): Promise<void> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    if (user.verifiedAt) {
      throw new UserAlreadyVerifiedError()
    }

    const code = await this.codeRepository.findByValueAndEntityId(
      codeValue,
      userId
    )

    if (!code) {
      throw new ResourceNotFoundError()
    }

    if (!code.isValid) {
      throw new CodeInvalidError()
    }

    const isExpired = code.expiredAt.getTime() < Date.now()

    if (isExpired) {
      throw new CodeExpiredError()
    }

    code.isValid = false

    await this.codeRepository.update(code)

    user.verifiedAt = new Date()

    await this.userRepository.update(user)
  }
}
