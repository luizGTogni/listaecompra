import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Reset Share Code Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to reset share code', async () => {
    const { token, user } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/share-code/reset`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperList).toEqual({
      id: shopperList.id,
      userId: user.id,
      shareCode: expect.any(String),
      title: shopperList.title,
      description: shopperList.description,
      closedAt: null,
      createdAt: expect.any(String)
    })
    expect(response.body.shopperList.shareCode).not.toEqual(
      shopperList.shareCode
    )
  })

  it('should not be able to reset share code if shopper list not found', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/3fa85f64-5717-4562-b3fc-2c963f66afa6/share-code/reset`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to reset share code if user is not the owner', async () => {
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

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/share-code/reset`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to reset share code if shopper list is closed', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({
      app,
      token,
      isClosed: true
    })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/share-code/reset`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ShopperListClosed' })
    )
  })

  it('should not be able to reset share code if user not auth', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/share-code/reset`)
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to reset share code if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/share-code/reset`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
