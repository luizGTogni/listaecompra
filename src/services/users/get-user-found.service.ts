import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { UserRepository } from '@/repositories/user.repository.js'

interface GetUserFoundRequest {
  userId: string
}

export class GetUserFoundService {
  constructor(private userRepository: UserRepository) {}

  async execute({ userId }: GetUserFoundRequest) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new ResourceNotFoundError()
    }

    return user
  }
}
