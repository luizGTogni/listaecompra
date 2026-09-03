import { User, UserInput } from '@/domain/user.entity.js'
import { randomUUID } from 'crypto'
import { UserRepository } from './user.repository.js'

export class InMemoryUserRepository implements UserRepository {
  private items: User[] = []

  async create(data: UserInput) {
    const user: User = {
      ...data,
      id: randomUUID(),
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.items.push(user)

    return { ...user }
  }

  async update(user: User) {
    const userIndex = this.items.findIndex((item) => item.id === user.id)

    this.items[userIndex] = user

    const userUpdated = this.items[userIndex]

    return { ...userUpdated }
  }

  async findById(id: string) {
    const user = this.items.find((item) => item.id === id)

    if (!user) {
      return null
    }

    return { ...user }
  }

  async findByEmail(email: string) {
    const user = this.items.find((item) => item.email === email)

    if (!user) {
      return null
    }

    return { ...user }
  }

  async findByUsername(username: string) {
    const user = this.items.find((item) => item.username === username)

    if (!user) {
      return null
    }

    return { ...user }
  }
}

export const inMemoryUserRepository = new InMemoryUserRepository()
