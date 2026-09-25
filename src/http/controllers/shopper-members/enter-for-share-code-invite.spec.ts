import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { PrismaUserRepository } from '@/repositories/user-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { createShopperList } from '@/utils/test/create-shopper-list.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

const otherUserData = {
  name: 'Susan Doe',
  username: 'susandoe',
  email: 'susandoe@email.com',
  password: 'hasher-123456'
}

describe('Enter For Share Code Invite Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to enter in shopper list for share code', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({ app, user: otherUserData })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(201)
    expect(response.body.shopperListMember).toEqual({
      shopperListId: shopperList.id,
      memberId: dataUser.user.id,
      acceptedAt: expect.any(String),
      invitedAt: expect.any(String)
    })
  })

  it('should be able to enter for share code if has a pending invite', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({ app, user: otherUserData })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/${shopperList.id}/members/invite`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: dataUser.user.username })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(201)
    expect(response.body.shopperListMember.acceptedAt).toEqual(
      expect.any(String)
    )
  })

  it('should not be able to enter for share code if share code not found', async () => {
    const dataUser = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: 'share-code-not-found' })

    expect(response.statusCode).toEqual(404)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceNotFound' })
    )
  })

  it('should not be able to enter for share code if shopper list is closed', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({ app, user: otherUserData })
    const { shopperList } = await createShopperList({
      app,
      token,
      isClosed: true
    })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ShopperListClosed' })
    )
  })

  it('should not be able to enter for share code if user is the owner', async () => {
    const { token } = await createAndAuthUser({ app })
    const { shopperList } = await createShopperList({ app, token })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Forbbiden' })
    )
  })

  it('should not be able to enter for share code if already a member', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({ app, user: otherUserData })
    const { shopperList } = await createShopperList({ app, token })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(409)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'ResourceAlreadyExists' })
    )
  })

  it('should not be able to enter for share code without share code', async () => {
    const dataUser = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({})

    expect(response.statusCode).toEqual(400)
  })

  it('should not be able to enter for share code if user not auth', async () => {
    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .send({ shareCode: 'any-code' })

    expect(response.statusCode).toEqual(401)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'Unauthorized' })
    )
  })

  it('should not be able to enter for share code if user not verified', async () => {
    const { token } = await createAndAuthUser({ app })
    const dataUser = await createAndAuthUser({ app, user: otherUserData })
    const { shopperList } = await createShopperList({ app, token })

    const userRepository = new PrismaUserRepository()

    await userRepository.update({
      ...dataUser.user,
      verifiedAt: null
    })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/shoppers/members/enter`)
      .set('Authorization', `Bearer ${dataUser.token}`)
      .send({ shareCode: shopperList.shareCode })

    expect(response.statusCode).toEqual(403)
    expect(response.body).toEqual(
      expect.objectContaining({ name: 'UserNotVerified' })
    )
  })
})
