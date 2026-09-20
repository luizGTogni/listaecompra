import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Change Password Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to change password', async () => {
    const { user, token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/users/password/change`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '12345678', newPassword: 'newpassword' })

    const userRepository = new PrismaUserRepository()

    const userUpdated = await userRepository.findById(user.id)

    expect(response.statusCode).toEqual(204)
    expect(user.passwordHash).not.toEqual(userUpdated?.passwordHash)
  })
})
