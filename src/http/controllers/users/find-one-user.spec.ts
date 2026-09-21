import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Find One User Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to find one user', async () => {
    const dataUserCreated = await createAndAuthUser({ app })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/users/me`)
      .set('Authorization', `Bearer ${dataUserCreated.token}`)
      .send({})

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: dataUserCreated.user.name,
        username: dataUserCreated.user.username,
        email: dataUserCreated.user.email,
        verifiedAt: expect.any(String),
        createdAt: expect.any(String)
      }
    })
  })
})
