import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { CodeExpiredError } from '@/http/types/errors/code-expired.error.js'
import { CodeInvalidError } from '@/http/types/errors/code-invalid.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { CodeRepository } from '@/repositories/code.repository.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface ResetPasswordRequest {
  codeValue: string
  newPassword: string
}

export class ResetPasswordService {
  constructor(
    private userRepository: UserRepository,
    private codeRepository: CodeRepository,
    private passwordHash: PasswordHashDriver
  ) {}

  async execute(data: ResetPasswordRequest): Promise<void> {
    const code = await this.codeRepository.findByValue(
      data.codeValue,
      'password_reset'
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

    const user = await this.userRepository.findById(code.entityId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    code.isValid = false

    await this.codeRepository.update(code)

    const passwordHash = await this.passwordHash.hash(data.newPassword)

    user.passwordHash = passwordHash

    await this.userRepository.update(user)
  }
}
