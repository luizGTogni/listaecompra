import { app } from '@/app.js'
import { API_URL_V1_BASE, env } from '@/config/env.js'
import request from 'supertest'

describe('CORS (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should allow credentials for the frontend origin', async () => {
    const response = await request(app.server)
      .options(`${API_URL_V1_BASE}/users/me`)
      .set('Origin', env.FRONTEND_URL)
      .set('Access-Control-Request-Method', 'PATCH')

    expect(response.headers['access-control-allow-origin']).toEqual(
      env.FRONTEND_URL
    )
    expect(response.headers['access-control-allow-credentials']).toEqual('true')
    expect(response.headers['access-control-allow-methods']).toContain('PATCH')
    expect(response.headers['access-control-allow-methods']).toContain('DELETE')
  })

  it('should not allow other origins', async () => {
    const response = await request(app.server)
      .options(`${API_URL_V1_BASE}/users/me`)
      .set('Origin', 'http://evil.com')
      .set('Access-Control-Request-Method', 'GET')

    expect(response.headers['access-control-allow-origin']).toBeUndefined()
    expect(response.headers['access-control-allow-credentials']).toBeUndefined()
  })
})
