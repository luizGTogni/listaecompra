import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

describe('Create Shopper List Invite Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await inMemoryShopperListMemberRepository.deleteAll()
    await inMemoryShopperItemRepository.deleteAll()
    await inMemoryShopperListRepository.deleteAll()
    await inMemoryCodeRepository.deleteAll()
    await inMemoryUserRepository.deleteAll()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to create a shopper list invite', async () => {
    const { token } = await createAndAuthUser({ app })
    const { user } = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(201)
    expect(response.body.shopperListMember).toEqual({
      shopperListId: shopperList.id,
      memberId: user.id,
      acceptedAt: null,
      invitedAt: expect.any(String)
    })
  })

  it('should not be able to create a shopper list invite if user request same memberId', async () => {
    const { token, user } = await createAndAuthUser({ app })

    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to create a shopper list invite if shopper list not found', async () => {
    const { token } = await createAndAuthUser({ app })
    const { user } = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${randomUUID()}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to create a shopper list invite if requester not owner shopper list', async () => {
    const { token } = await createAndAuthUser({ app })
    const { user } = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })

    const userNotOwner = await createAndAuthUser({
      app,
      user: {
        name: 'Warner Doe',
        username: 'warnerdoe',
        email: 'warnerdoe@email.com',
        password: 'hasher-123456'
      }
    })

    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${userNotOwner.token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to create a shopper list invite if shopper list closed', async () => {
    const { token } = await createAndAuthUser({ app })
    const { user } = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({
      app,
      token,
      isClosed: true
    })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ShopperListClosed' })
    )
  })

  it('should not be able to create a shopper list invite if member already exists in the shopper list member', async () => {
    const { token } = await createAndAuthUser({ app })
    const { user } = await createAndAuthUser({
      app,
      user: {
        name: 'Susan Doe',
        username: 'susandoe',
        email: 'susandoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({
      app,
      token
    })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceAlreadyExists' })
    )
  })

  it('should not be able to create a shopper list invite if member not found', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({
      app,
      token
    })

    const response = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${randomUUID()}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })
})
