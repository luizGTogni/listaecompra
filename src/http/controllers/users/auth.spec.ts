import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Auth Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to auth user', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'contato.togni@gmail.com',
      password: '123456'
    }

    await request(app.server).post(`${API_URL_V1_BASE}/users`).send(data)

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/session`)
      .send({
        email: data.email,
        password: data.password
      })

    const [sessionCookie] = response.headers[
      'set-cookie'
    ] as unknown as string[]

    expect(response.statusCode).toEqual(204)
    expect(sessionCookie).toEqual(expect.any(String))
  })

  it('should set the session as an httpOnly cookie', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'contato.togni@gmail.com',
      password: '123456'
    }

    await request(app.server).post(`${API_URL_V1_BASE}/users`).send(data)

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/session`)
      .send({ email: data.email, password: data.password })

    const [sessionCookie] = response.headers[
      'set-cookie'
    ] as unknown as string[]

    expect(sessionCookie).toMatch(/^token=eyJ/)
    expect(sessionCookie).toContain('HttpOnly')
    expect(sessionCookie).toContain('SameSite=Lax')
    expect(sessionCookie).toContain('Path=/')
    expect(sessionCookie).toContain('Max-Age=604800')
  })

  it('should not set the cookie with invalid credentials', async () => {
    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/session`)
      .send({ email: 'nobody@email.com', password: '123456' })

    expect(response.statusCode).toEqual(401)
    expect(response.headers['set-cookie']).toBeUndefined()
  })
})
