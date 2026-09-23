import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Find All Shopper List Invite Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to find all a shopper list invites', async () => {
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
    const dataShopperList1 = await createShopperList({ app, token })
    const dataShopperList2 = await createShopperList({
      app,
      token,
      shopperList: {
        title: 'ShopperList2',
        description: ''
      }
    })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList1.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList2.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/users/shoppers/invites`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperListMembers).toHaveLength(2)
    expect(response.body.shopperListMembers).toEqual([
      expect.objectContaining({
        shopperListId: dataShopperList2.shopperList.id,
        shopperList: {
          title: dataShopperList2.shopperList.title,
          user: { name: 'John Doe', username: 'johndoe' }
        }
      }),
      expect.objectContaining({
        shopperListId: dataShopperList1.shopperList.id,
        shopperList: {
          title: dataShopperList1.shopperList.title,
          user: { name: 'John Doe', username: 'johndoe' }
        }
      })
    ])
  })

  it('should list the most recently invited shopper list first', async () => {
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
    const dataShopperList1 = await createShopperList({ app, token })
    const dataShopperList2 = await createShopperList({
      app,
      token,
      shopperList: {
        title: 'ShopperList2',
        description: ''
      }
    })
    const dataShopperList3 = await createShopperList({
      app,
      token,
      shopperList: {
        title: 'ShopperList3',
        description: ''
      }
    })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList1.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList2.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList3.shopperList.id}/members/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/users/shoppers/invites`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperListMembers).toHaveLength(3)
    expect(response.body.shopperListMembers).toEqual([
      expect.objectContaining({
        shopperListId: dataShopperList3.shopperList.id
      }),
      expect.objectContaining({
        shopperListId: dataShopperList2.shopperList.id
      }),
      expect.objectContaining({
        shopperListId: dataShopperList1.shopperList.id
      })
    ])
  })
})
