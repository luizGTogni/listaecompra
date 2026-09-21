import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Logout Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should clear the session cookie', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/session/logout`)
      .set('Cookie', `token=${token}`)

    const [clearedCookie] = response.headers[
      'set-cookie'
    ] as unknown as string[]

    expect(response.statusCode).toEqual(204)
    expect(clearedCookie).toContain('token=;')
    expect(clearedCookie).toContain('HttpOnly')
    expect(clearedCookie).toContain('Path=/')
    expect(clearedCookie).toMatch(/Expires=Thu, 01 Jan 1970/)
  })

  it('should be able to logout without a session', async () => {
    const response = await request(app.server).post(
      `${API_URL_V1_BASE}/session/logout`
    )

    expect(response.statusCode).toEqual(204)
  })
})
