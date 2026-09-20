import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Resend Code Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to resend verication code', async () => {
    const { user, token } = await createAndAuthUser({ app })

    const codeRepository = new PrismaCodeRepository()

    const [oldCode] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const [newCode] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(oldCode.id).not.toEqual(newCode.id)

    expect(response.statusCode).toEqual(204)
  })
})
