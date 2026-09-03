import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import request from 'supertest'

describe('Health Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to show health status server', async () => {
    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/health`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual({
      status: 'ok'
    })
  })
})
