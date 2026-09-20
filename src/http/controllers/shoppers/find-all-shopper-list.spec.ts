import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Find All Shopper List Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to find all shopper list', async () => {
    const { token } = await createAndAuthUser({ app })

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `${dataShopperList.title}-1`,
        description: dataShopperList.description
      })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `${dataShopperList.title}-2`,
        description: dataShopperList.description
      })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperLists).toHaveLength(2)
    expect(response.body.shopperLists).toEqual([
      expect.objectContaining({ title: `${dataShopperList.title}-1` }),
      expect.objectContaining({ title: `${dataShopperList.title}-2` })
    ])
  })

  it('should be able to find all shopper list by query title', async () => {
    const { token } = await createAndAuthUser({ app })

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `${dataShopperList.title}-1`,
        description: dataShopperList.description
      })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: `${dataShopperList.title}-2`,
        description: dataShopperList.description
      })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers?query=${dataShopperList.title}-2`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperLists).toHaveLength(1)
    expect(response.body.shopperLists).toEqual([
      expect.objectContaining({ title: `${dataShopperList.title}-2` })
    ])
  })

  it('should be able to find all shopper list by page', async () => {
    const { token } = await createAndAuthUser({ app })

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    for (let i = 1; i <= 12; i++) {
      await request(app.server)
        .post(`${API_URL_V1_BASE}/shoppers`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: `${dataShopperList.title}-${i}`,
          description: dataShopperList.description
        })
    }

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers?page=2`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperLists).toHaveLength(2)
    expect(response.body.shopperLists).toEqual([
      expect.objectContaining({ title: `${dataShopperList.title}-11` }),
      expect.objectContaining({ title: `${dataShopperList.title}-12` })
    ])
  })

  it('should not list shopper lists where the user is only a member', async () => {
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

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    const responseShopperList = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperList.title,
        description: dataShopperList.description
      })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperLists).toHaveLength(0)
  })

  it('should not be able to find all shopper list if user not auth', async () => {
    const { token } = await createAndAuthUser({ app })

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperList.title,
        description: dataShopperList.description
      })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers`)
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to find all shopper list if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })

    const dataShopperList = {
      title: 'ShopperList',
      description: 'ShopperList Description'
    }

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperList.title,
        description: dataShopperList.description
      })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
