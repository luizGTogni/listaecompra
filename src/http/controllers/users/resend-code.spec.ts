import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Resend Code Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to resend verication code', async () => {
    const { user, token } = await createAndAuthUser({ app })

    const [oldCode] = await inMemoryCodeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const [newCode] = await inMemoryCodeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(oldCode.id).not.toEqual(newCode.id)

    expect(response.statusCode).toEqual(204)
  })
})
