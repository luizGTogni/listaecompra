import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface GetUserFoundByUsernameRequest {
  username: string
}

export class GetUserFoundByUsernameService {
  constructor(private userRepository: UserRepository) {}

  async execute({ username }: GetUserFoundByUsernameRequest) {
    const user = await this.userRepository.findByUsername(username)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return user
  }
}
