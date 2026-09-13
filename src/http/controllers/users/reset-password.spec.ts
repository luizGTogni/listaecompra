import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { inMemoryCodeRepository } from '@/repositories/code-in-memory.repository.js'
import { inMemoryShopperItemRepository } from '@/repositories/shopper-item-in-memory.repository.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { inMemoryShopperListMemberRepository } from '@/repositories/shopper-list-member-in-memory.repository.js'
import { inMemoryUserRepository } from '@/repositories/user-in-memory.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import request from 'supertest'

describe('Reset Password Controller (e2e)', () => {
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

  it('should be able to reset password', async () => {
    const { user } = await createAndAuthUser({ app })

    await request(app.server)
      .post(`${API_URL_V1_BASE}/password/forgot`)
      .send({ email: user.email })

    const [code] = await inMemoryCodeRepository.findAllActiveByEntityId(
      user.id,
      'password_reset'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/password/reset`)
      .send({ codeValue: code.value, newPassword: 'newpassword' })

    expect(response.statusCode).toEqual(204)

    const userUpdated = await inMemoryUserRepository.findByEmail(user.email)

    expect(user.passwordHash).not.toEqual(userUpdated?.passwordHash)
  })
})
