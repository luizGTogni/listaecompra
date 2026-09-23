import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Remove Item Shopper List Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to remove item in shopper list', async () => {
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

    const dataShopperItem = {
      title: 'ShopperItem',
      description: 'ShopperItem Description',
      quantity: 1
    }

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })

  it('should be able to remove item in shopper list if member with accepted invite', async () => {
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

    const dataShopperItem = {
      title: 'ShopperItem',
      description: 'ShopperItem Description',
      quantity: 1
    }

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/remove`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(204)
  })

  it('should not be able to remove item in shopper list if member with pending invite', async () => {
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

    const dataShopperItem = {
      title: 'ShopperItem',
      description: 'ShopperItem Description',
      quantity: 1
    }

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/remove`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to remove item in shopper list if user not auth', async () => {
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

    const dataShopperItem = {
      title: 'ShopperItem',
      description: 'ShopperItem Description',
      quantity: 1
    }

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/remove`
      )

      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to add item in shopper list if user not verified', async () => {
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

    const dataShopperItem = {
      title: 'ShopperItem',
      description: 'ShopperItem Description',
      quantity: 1
    }

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: dataShopperItem.title,
        description: dataShopperItem.description,
        quantity: dataShopperItem.quantity
      })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
