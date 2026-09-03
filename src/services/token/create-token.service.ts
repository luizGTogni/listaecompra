import { User } from '@/domain/user.entity.js'
import { TokenDriver } from '@/drivers/auth/token.driver.js'

interface CreateTokenRequest {
  user: User
}

interface CreateTokenResponse {
  token: string
}

export class CreateTokenService {
  constructor(private tokenDriver: TokenDriver) {}

  async execute({ user }: CreateTokenRequest): Promise<CreateTokenResponse> {
    const token = this.tokenDriver.sign({ sub: user.id })

    return { token }
  }
}
