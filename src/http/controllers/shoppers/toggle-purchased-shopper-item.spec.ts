import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Toggle Purchased Shopper Item Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await inMemoryShopperItemRepository.deleteAll()
    await inMemoryShopperListRepository.deleteAll()
    await inMemoryCodeRepository.deleteAll()
    await inMemoryUserRepository.deleteAll()
  })

  afterAll(() => {
    app.close()
  })

  it('should be able to toggle purchased shopper item for purchased', async () => {
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
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/purchase`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperItem).toEqual({
      id: expect.any(String),
      shopperListId: responseShopperList.body.shopperList.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity,
      purchasedAt: expect.any(String),
      createdAt: expect.any(String)
    })
  })

  it('should be able to toggle purchased shopper item for not purchased', async () => {
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

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/purchase`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/purchase`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperItem).toEqual({
      id: expect.any(String),
      shopperListId: responseShopperList.body.shopperList.id,
      title: dataShopperItem.title,
      description: dataShopperItem.description,
      quantity: dataShopperItem.quantity,
      purchasedAt: null,
      createdAt: expect.any(String)
    })
  })

  it('should not be able to toggle purchased shopper item if user not auth', async () => {
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
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/purchase`
      )
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to toggle purchased in shopper item if user not verified', async () => {
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

    await inMemoryUserRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}/purchase`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
