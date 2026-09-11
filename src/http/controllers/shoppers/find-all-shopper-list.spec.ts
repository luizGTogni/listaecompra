import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Find All Shopper List Controller (e2e)', () => {
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

    await inMemoryUserRepository.update({
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
