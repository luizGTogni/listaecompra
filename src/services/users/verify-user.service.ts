import { CodeExpiredError } from '@/http/types/errors/code-expired.error.js'
import { CodeInvalidError } from '@/http/types/errors/code-invalid.error.js'
import { UserAlreadyVerifiedError } from '@/http/types/errors/user-already-verified.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from './get-user-found.service.js'

interface VerifyUserRequest {
  userId: string
  codeValue: string
}

export class VerifyUserService {
  constructor(
    private getUserFound: GetUserFoundService,
    private userRepository: UserRepository,
    private codeRepository: CodeRepository
  ) {}

  async execute({ userId, codeValue }: VerifyUserRequest): Promise<void> {
    const user = await this.getUserFound.execute({ userId })

    if (user.verifiedAt) {
      throw new UserAlreadyVerifiedError()
    }

    const code = await this.codeRepository.findByValueAndEntityId(
      codeValue,
      userId,
      'user_verification'
    )

    if (!code) {
      throw new CodeInvalidError()
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
