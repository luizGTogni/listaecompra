import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import request from 'supertest'

describe('Auth Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to auth user', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      password: '123456'
    }

    await request(app.server).post(`${API_URL_V1_BASE}/users`).send(data)

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/session`)
      .send({
        email: data.email,
        password: data.password
      })

    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toEqual(expect.any(String))
  })
})
