import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Reset Password Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to reset password', async () => {
    const { user } = await createAndAuthUser({ app })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/password/forgot`)
      .send({ email: user.email })

    const userRepository = new PrismaUserRepository()
    const codeRepository = new PrismaCodeRepository()

    const [code] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'password_reset'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/password/reset`)
      .send({ codeValue: code.value, newPassword: 'newpassword' })

    expect(response.statusCode).toEqual(204)

    const userUpdated = await userRepository.findByEmail(user.email)

    expect(user.passwordHash).not.toEqual(userUpdated?.passwordHash)
  })
})
