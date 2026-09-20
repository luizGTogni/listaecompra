import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Verify User Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to verify user', async () => {
    const { token, user } = await createAndAuthUser({ app, isVerified: false })

    const codeRepository = new PrismaCodeRepository()

    const [code] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users/verify`)
      .set('Authorization', `Bearer ${token}`)
      .send({ codeValue: code.value })

    expect(response.statusCode).toEqual(204)
  })
})
