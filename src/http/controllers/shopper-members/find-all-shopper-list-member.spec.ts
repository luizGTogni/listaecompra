import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import request from 'supertest'

describe('Find All Shopper List Member Controller (e2e)', () => {
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

  it('should be able to find all a shopper list members if owner', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperListMembers).toHaveLength(1)
    expect(response.body.shopperListMembers).toEqual([
      expect.objectContaining({
        shopperListId: shopperList.id,
        memberId: dataUser.user.id
      })
    ])
  })

  it('should be able to find all a shopper list members if member', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperListMembers).toHaveLength(1)
    expect(response.body.shopperListMembers).toEqual([
      expect.objectContaining({
        shopperListId: shopperList.id,
        memberId: dataUser.user.id
      })
    ])
  })

  it('should not be able to find all a shopper list members if user not access', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({
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
      .get(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to find all a shopper list members if shopper list not found', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/shopper-list-not-found/members`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to find all a shopper list members if user not auth', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members`)
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to find all a shopper list members if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    await inMemoryUserRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
