import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

function getPort() {
  const address = app.server.address()

  if (!address || typeof address === 'string') {
    throw new Error('Server is not listening on a port')
  }

  return address.port
}

function connectToStream(shopperListId: string, token: string) {
  const port = getPort()
  const controller = new AbortController()

  const responsePromise = fetch(
    `http://127.0.0.1:${port}${API_URL_V1_BASE}/shoppers/${shopperListId}/events`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    }
  )

  return { responsePromise, controller }
}

async function readNextChunk(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const timeout = new Promise<string>((resolve) =>
    setTimeout(() => resolve('__TIMEOUT__'), 2000)
  )

  const read = reader
    .read()
    .then((result) =>
      result.done ? '__CLOSED__' : new TextDecoder().decode(result.value)
    )

  return Promise.race([read, timeout])
}

describe('Stream Shopper List Events Controller (e2e)', () => {
  beforeAll(async () => {
    await app.listen({ port: 0 })
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to receive events published in the shopper list as the owner', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      token
    )

    const response = await responsePromise

    expect(response.status).toEqual(200)
    expect(response.headers.get('content-type')).toEqual('text/event-stream')

    const reader = response.body!.getReader()

    const itemResponse = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/items/add`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'ShopperItem', description: '', quantity: 1 })

    const chunk = await readNextChunk(reader)

    expect(chunk).toContain('event: item-added')
    expect(chunk).toContain(itemResponse.body.shopperItem.id)

    controller.abort()
  })

  it('should be able to receive events as an accepted member', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataMember = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataMember.user.username })

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataMember.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataMember.token}`)
      .send()

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      dataMember.token
    )

    const response = await responsePromise

    expect(response.status).toEqual(200)

    controller.abort()
  })

  it('should not be able to connect to the stream if user not member', async () => {
    const { token } = await createAndAuthUser({ app })
    const otherUser = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      otherUser.token
    )

    const response = await responsePromise

    expect(response.status).toEqual(404)

    controller.abort()
  })

  it('should not be able to connect to the stream if shopper list not found', async () => {
    const { token } = await createAndAuthUser({ app })

    const { responsePromise, controller } = connectToStream(
      '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      token
    )

    const response = await responsePromise

    expect(response.status).toEqual(404)

    controller.abort()
  })

  it('should not be able to connect to the stream if user not auth', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      'invalid-token'
    )

    const response = await responsePromise

    expect(response.status).toEqual(401)

    controller.abort()
  })

  it('should not be able to connect to the stream if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      token
    )

    const response = await responsePromise

    expect(response.status).toEqual(403)

    controller.abort()
  })

  it('should close the connection when the member is removed from the shopper list', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataMember = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataMember.user.username })

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataMember.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataMember.token}`)
      .send()

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      dataMember.token
    )

    const response = await responsePromise
    const reader = response.body!.getReader()

    await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataMember.user.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const chunk = await readNextChunk(reader)

    expect(chunk).toEqual('__CLOSED__')

    controller.abort()
  })

  it('should close the connection when the shopper list is deleted', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const { responsePromise, controller } = connectToStream(
      shopperList.id,
      token
    )

    const response = await responsePromise
    const reader = response.body!.getReader()

    await request(app.server)
      .delete(`${API_URL_V1_BASE}/shoppers/${shopperList.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const chunk = await readNextChunk(reader)

    expect(chunk).toEqual('__CLOSED__')

    controller.abort()
  })
})
