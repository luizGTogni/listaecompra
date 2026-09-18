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

describe('Find All Shopper List Invite Controller (e2e)', () => {
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
        `${API_URL_V1_BASE}/shoppers/${dataShopperList1.shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${dataShopperList2.shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .get(`${API_URL_V1_BASE}/users/shoppers/invites`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(200)
    expect(response.body.shopperListMembers).toHaveLength(2)
    expect(response.body.shopperListMembers).toEqual([
      expect.objectContaining({
        shopperListId: dataShopperList1.shopperList.id
      }),
      expect.objectContaining({
        shopperListId: dataShopperList2.shopperList.id
      })
    ])
  })
})
