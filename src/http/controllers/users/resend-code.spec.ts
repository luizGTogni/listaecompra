import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { prisma } from '@/config/prisma.js'
import { PrismaCodeRepository } from '@/repositories/code-prisma.repository.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

async function skipCooldown(userId: string) {
  await prisma.code.updateMany({
    where: { entityId: userId },
    data: { createdAt: new Date(Date.now() - 61 * 1000) }
  })
}

describe('Resend Code Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to resend verication code', async () => {
    const { user, token } = await createAndAuthUser({ app })

    const codeRepository = new PrismaCodeRepository()

    await skipCooldown(user.id)

    const [oldCode] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const [newCode] = await codeRepository.findAllActiveByEntityId(
      user.id,
      'user_verification'
    )

    expect(oldCode.id).not.toEqual(newCode.id)

    expect(response.statusCode).toEqual(204)
  })

  it('should return 429 with Retry-After during the cooldown', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(response.statusCode).toEqual(429)
    expect(response.body.name).toEqual('TooManyRequests')
    expect(Number(response.headers['retry-after'])).toBeGreaterThan(0)
    expect(Number(response.headers['retry-after'])).toBeLessThanOrEqual(60)
  })

  it('should be able to resend again after the cooldown', async () => {
    const { user, token } = await createAndAuthUser({ app })

    await skipCooldown(user.id)

    const first = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    const second = await request(app.server)
      .post(`${API_URL_V1_BASE}/code/resend`)
      .set('Authorization', `Bearer ${token}`)
      .send()

    expect(first.statusCode).toEqual(204)
    expect(second.statusCode).toEqual(429)
  })
})
