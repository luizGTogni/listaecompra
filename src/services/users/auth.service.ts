import { User } from '@/domain/user.entity.js'
import { PasswordHashDriver } from '@/drivers/password/password-hash.driver.js'
import { InvalidCredentialsError } from '@/http/types/errors/invalid-credentials.error.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface AuthRequest {
  email: string
  passwordPlain: string
}

interface AuthResponse {
  user: User
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHashDriver
  ) {}

  async execute({ email, passwordPlain }: AuthRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isPasswordMatch = await this.passwordHasher.verify(
      passwordPlain,
      user.passwordHash
    )

    if (!isPasswordMatch) {
      throw new InvalidCredentialsError()
    }

    return { user }
  }
}
