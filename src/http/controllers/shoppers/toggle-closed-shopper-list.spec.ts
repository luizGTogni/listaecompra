import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Toggle Closed Shopper List Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to toggle closed shopper list for closed', async () => {
    const { token, user } = await createAndAuthUser({ app })

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

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperList).toEqual({
      id: expect.any(String),
      userId: user.id,
      title: dataShopperList.title,
      description: dataShopperList.description,
      closedAt: expect.any(String),
      createdAt: expect.any(String)
    })
  })

  it('should be able to toggle closed shopper list for not closed', async () => {
    const { token, user } = await createAndAuthUser({ app })

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
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperList).toEqual({
      id: expect.any(String),
      userId: user.id,
      title: dataShopperList.title,
      description: dataShopperList.description,
      closedAt: null,
      createdAt: expect.any(String)
    })
  })

  it('should not be able to toggle closed shopper list if member with accepted invite', async () => {
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
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to toggle closed shopper list if user not auth', async () => {
    const { token } = await createAndAuthUser({ app })

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

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to toggle closed shopper list if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })

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

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/close`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
