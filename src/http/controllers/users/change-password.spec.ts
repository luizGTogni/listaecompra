import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Change Password Controller (e2e)', () => {
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

  it('should be able to change password', async () => {
    const { user, token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .patch(`${API_URL_V1_BASE}/users/password/change`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: '12345678', newPassword: 'newpassword' })

    const userUpdated = await inMemoryUserRepository.findById(user.id)

    expect(response.statusCode).toEqual(204)
    expect(user.passwordHash).not.toEqual(userUpdated?.passwordHash)
  })
})
