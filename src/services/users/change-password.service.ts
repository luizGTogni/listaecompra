import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { InvalidCredentialsError } from '@/http/types/errors/invalid-credentials.error.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { SamePasswordError } from '@/http/types/errors/same-password.error.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface ChangePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

export class ChangePasswordService {
  constructor(
    private userRepository: UserRepository,
    private passwordHash: PasswordHashDriver
  ) {}

  async execute(data: ChangePasswordRequest): Promise<void> {
    const user = await this.userRepository.findById(data.userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    const doesPasswordMatch = await this.passwordHash.verify(
      data.currentPassword,
      user.passwordHash
    )

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError()
    }

    if (data.currentPassword === data.newPassword) {
      throw new SamePasswordError()
    }

    const passwordHash = await this.passwordHash.hash(data.newPassword)

    user.passwordHash = passwordHash

    await this.userRepository.update(user)
  }
}
