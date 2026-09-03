import { User, UserInput } from '@/domain/user.entity.js'

export interface UserRepository {
  create(data: UserInput): Promise<User>
  update(user: User): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
}
