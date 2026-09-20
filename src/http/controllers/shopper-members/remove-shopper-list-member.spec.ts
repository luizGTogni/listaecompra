import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaShopperListMemberRepository } from '@/repositories/shopper-list-member-prisma.repository.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('Remove Shopper List Member Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to remove a shopper list member if owner', async () => {
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const userRepository = new PrismaShopperListMemberRepository()

    const shopperListMember =
      await userRepository.findByShopperListIdAndMemberId(
        shopperList.id,
        dataUser.user.id
      )

    expect(response.statusCode).toEqual(204)
    expect(response.body).toEqual({})
    expect(shopperListMember).toBeFalsy()
  })

  it('should be able to remove a shopper list member if member remove himself', async () => {
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/accept`
      )
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
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

  it('should not be able to remove a shopper list member if other member try remove', async () => {
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
    const otherMember = await createAndAuthUser({
      app,
      user: {
        name: 'Doug Doe',
        username: 'dougdoe',
        email: 'dougdoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${otherMember.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    await request(app.server)
      .patch(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${otherMember.user.id}/accept`
      )
      .set('Authorization', `Bearer ${otherMember.token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${otherMember.token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to remove a shopper list member if requester not access', async () => {
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
    const userNotAccess = await createAndAuthUser({
      app,
      user: {
        name: 'Warner Doe',
        username: 'warnerdoe',
        email: 'warnerdoe@email.com',
        password: 'hasher-123456'
      }
    })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${userNotAccess.token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to remove a shopper list member if shopper list not found', async () => {
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

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/shopper-list-not-found/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to remove a shopper list member if member not found', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/member-not-found/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to remove a shopper list member if shopper list member not found', async () => {
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
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to remove a shopper list member if user not auth', async () => {
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .send()

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to remove a shopper list member if user not verified', async () => {
    const { token, user } = await createAndAuthUser({ app })
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
      .post(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/invite`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .delete(
        `${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/${dataUser.user.id}/remove`
      )
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
