import { prisma } from '@/config/prisma.js'
import { User, UserInput } from '@/domain/user.entity.js'
import { isUuid } from '@/utils/is-uuid.js'
import { UserRepository } from './user.repository.js'

export class PrismaUserRepository implements UserRepository {
  async create(data: UserInput) {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash
      }
    })

    return { ...user }
  }

  async update(user: User) {
    const userUpdated = await prisma.user.update({
      where: { id: user.id },
      data: user
    })

    return { ...userUpdated }
  }

  async deleteAll() {
    await prisma.user.deleteMany()
  }

  async findById(id: string) {
    if (!isUuid(id)) {
      return null
    }

    const user = await prisma.user.findUnique({ where: { id } })

    return user ? { ...user } : null
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })

    return user ? { ...user } : null
  }

  async findByUsername(username: string) {
    const user = await prisma.user.findUnique({ where: { username } })

    return user ? { ...user } : null
  }
}
