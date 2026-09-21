import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Create User Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a user', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'contato.togni@gmail.com',
      password: '123456'
    }

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users`)
      .send(data)

    expect(response.statusCode).toEqual(201)
    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: data.name,
        username: data.username,
        email: data.email,
        verifiedAt: null,
        createdAt: expect.any(String)
      }
    })
  })

  it('should return 400 with the invalid fields', async () => {
    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users`)
      .send({ name: '', username: 'a!', email: 'invalid', password: 'a' })

    expect(response.statusCode).toEqual(400)
    expect(response.body.name).toEqual('ValidationError')

    const fields = response.body.fields.map(
      (issue: { field: string }) => issue.field
    )

    expect(fields).toEqual(
      expect.arrayContaining(['name', 'username', 'email', 'password'])
    )
    expect(response.body.fields).toContainEqual({
      field: 'email',
      code: 'invalid_format',
      message: 'Invalid email address.'
    })
  })

  it('should return 409 EmailAlreadyExists when email is already in use', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      password: '123456'
    }

    await request(app.server).post(`${API_URL_V1_BASE}/users`).send(data)

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users`)
      .send({ ...data, username: 'johndoe2' })

    expect(response.statusCode).toEqual(409)
    expect(response.body.name).toEqual('EmailAlreadyExists')
  })

  it('should return 409 UsernameAlreadyExists when username is already in use', async () => {
    const data = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@email.com',
      password: '123456'
    }

    await request(app.server).post(`${API_URL_V1_BASE}/users`).send(data)

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/users`)
      .send({ ...data, email: 'johndoe2@email.com' })

    expect(response.statusCode).toEqual(409)
    expect(response.body.name).toEqual('UsernameAlreadyExists')
  })
})
