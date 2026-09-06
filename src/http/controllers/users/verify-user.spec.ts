import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Verify User Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to verify user', async () => {
    const { token, user } = await createAndAuthUser({ app })

    const [code] = await inMemoryCodeRepository.findAllActiveByEntityId(
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
