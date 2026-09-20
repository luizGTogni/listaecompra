import { API_URL_V1_BASE } from '@/config/env.js'
import { User } from '@/domain/user.entity.js'
import { ResourceNotFoundError } from '@/http/types/errors/resource-not-found.error.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { FastifyInstance } from 'fastify'
import request from 'supertest'

interface CreateAndAuthUserParams {
  app: FastifyInstance
  isVerified?: boolean
  user?: {
    name: string
    username: string
    email: string
    password: string
  }
}

interface CreateAndAuthUserResponse {
  token: string
  user: User
}

export async function createAndAuthUser({
  app,
  isVerified = true,
  user = {
    name: 'John Doe',
    username: 'johndoe',
    email: 'contato.togni@gmail.com',
    password: '12345678'
  }
}: CreateAndAuthUserParams): Promise<CreateAndAuthUserResponse> {
  const responseUser = await request(app.server)
    .post(`${API_URL_V1_BASE}/users`)
    .send(user)

  const responseAuth = await request(app.server)
    .post(`${API_URL_V1_BASE}/session`)
    .send({
      email: user.email,
      password: user.password
    })

  const userCreated: User = responseUser.body.user

  const userRepository = new PrismaUserRepository()

  const userFounded = await userRepository.findById(userCreated.id)
  if (!userFounded) {
    throw new ResourceNotFoundError()
  }

  await userRepository.update({
    ...userFounded,
    verifiedAt: isVerified ? new Date() : null
  })

  return { token: responseAuth.body.token, user: responseUser.body.user }
}
