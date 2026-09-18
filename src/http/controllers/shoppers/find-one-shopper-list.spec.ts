import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Find One Shopper List Controller (e2e)', () => {
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

  it('should be able to find one shopper list', async () => {
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

    await request(app.server)
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
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}`
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
      createdAt: expect.any(String),
      items: [
        expect.objectContaining({ title: 'ShopperItem1' }),
        expect.objectContaining({ title: 'ShopperItem2' })
      ]
    })
  })

  it('should be able to find one shopper list if member with accepted invite', async () => {
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
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperList).toEqual(
      expect.objectContaining({ id: responseShopperList.body.shopperList.id })
    )
  })

  it('should not be able to find one shopper list if member with pending invite', async () => {
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

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
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

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}`
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

    await inMemoryUserRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .get(
        `${API_URL_V1_BASE}/shoppers/${responseShopperList.body.shopperList.id}`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
