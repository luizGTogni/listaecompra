import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { InvalidCredentialsError } from '@/http/types/errors/invalid-credentials.error.js'
import { SamePasswordError } from '@/http/types/errors/same-password.error.js'
import { UserRepository } from '@/repositories/user.repository.js'
import { GetUserFoundService } from './get-user-found.service.js'

interface ChangePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
}

export class ChangePasswordService {
  constructor(
    private getUserFound: GetUserFoundService,
    private userRepository: UserRepository,
    private passwordHash: PasswordHashDriver
  ) {}

  async execute(data: ChangePasswordRequest): Promise<void> {
    const user = await this.getUserFound.execute({ userId: data.userId })

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
