import { API_URL_V1_BASE } from '@/config/env.js'
import { User } from '@/domain/user.entity.js'
import { FastifyInstance } from 'fastify'
import request from 'supertest'

interface CreateAndAuthUserParams {
  app: FastifyInstance
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

  return { token: responseAuth.body.token, user: responseUser.body.user }
}
