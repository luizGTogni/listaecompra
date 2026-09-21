import { User } from '@/domain/user.entity.js'
import { GetUserFoundService } from './get-user-found.service.js'

interface FindOneUserRequest {
  userId: string
}

interface FindOneUserResponse {
  user: User
}

export class FindOneUserService {
  constructor(private getUserFound: GetUserFoundService) {}

  async execute({ userId }: FindOneUserRequest): Promise<FindOneUserResponse> {
    const user = await this.getUserFound.execute({ userId })

    return { user }
  }
}
