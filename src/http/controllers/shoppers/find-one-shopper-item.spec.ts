import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Find One Shopper Item Controller (e2e)', () => {
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

  it('should be able to find one shopper item', async () => {
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ShopperItem1',
        description: '',
        quantity: 2
      })

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ShopperItem2',
        description: '',
        quantity: 2
      })

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperItem).toEqual({
      id: expect.any(String),
      shopperListId: responseShopperList.body.shopperList.id,
      title: 'ShopperItem2',
      description: '',
      quantity: 2,
      purchasedAt: null,
      createdAt: expect.any(String),
      shopperList: {
        userId: user.id,
        title: dataShopperList.title,
        description: dataShopperList.description,
        closedAt: null
      }
    })
  })

  it('should not be able to find one shopper list if user not auth', async () => {
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

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ShopperItem',
        description: '',
        quantity: 2
      })

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}`
      )
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to find one shopper list if user not verified', async () => {
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

    const responseShopperItem = await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/add`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'ShopperItem',
        description: '',
        quantity: 2
      })

    await inMemoryUserRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}/items/${responseShopperItem.body.shopperItem.id}`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
