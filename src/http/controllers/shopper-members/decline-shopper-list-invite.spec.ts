import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'

import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Decline Shopper List Invite Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to decline a shopper list invite', async () => {
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
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/decline`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const shopperListMemberRepository = new PrismaShopperListMemberRepository()

    const shopperListMember =
      await shopperListMemberRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        dataUser.user.id
      )

    expect(response.statusCode).toEqual(204)
    expect(response.body).toEqual({})
    expect(shopperListMember).toBeFalsy()
  })

  it('should not be able to decline a shopper list invite if other user try decline', async () => {
    const { token, user } = await createAndAuthUser({ app })
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

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: user.username })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${user.id}/decline`
      )
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to decline a shopper list invite if invite already accept', async () => {
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
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/decline`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to decline a shopper list invite if shopper list invite not found', async () => {
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

    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/decline`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to decline a shopper list invite if user not auth', async () => {
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

    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/decline`
      )
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to decline a shopper list invite if user not verified', async () => {
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

    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...dataUser.user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/decline`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
