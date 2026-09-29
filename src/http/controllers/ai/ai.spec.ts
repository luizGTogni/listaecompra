import { app } from '@/app.js'
import { API_URL_V1_BASE } from '@/config/env.js'
import { createAndAuthUser } from '@/utils/test/create-and-auth-user.js'
import { resetDb } from '@/utils/test/reset-db.js'
import request from 'supertest'

describe('AI Controller (e2e)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterEach(async () => {
    await resetDb()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to chat and receive items with a unit', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/ai/chat`)
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: [{ role: 'user', content: 'bolo de cenoura' }] })

    expect(response.statusCode).toEqual(200)
    expect(response.body.proposal.addItems).toEqual([
      { title: 'Cenoura', quantity: 3, unit: 'UNIT' },
      { title: 'Ovos', quantity: 4, unit: 'UNIT' }
    ])
  })

  it('should be able to apply a proposal with units and fractional quantities', async () => {
    const { token } = await createAndAuthUser({ app })

    const responseApply = await request(app.server)
      .post(`${API_URL_V1_BASE}/ai/apply`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Churrasco',
        addItems: [
          { title: 'Picanha', quantity: 1.5, unit: 'KG' },
          { title: 'Cachaça', quantity: 2, unit: 'BOTTLE' },
          { title: 'Vodka', quantity: 2.5, unit: 'BOTTLE' },
          { title: 'Carvão', quantity: 2 }
        ]
      })

    expect(responseApply.statusCode).toEqual(200)
    expect(responseApply.body.added).toEqual(3)

    const responseList = await request(app.server)
      .get(`${API_URL_V1_BASE}/shoppers/${responseApply.body.shopperListId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(
      responseList.body.shopperList.shopperItems.map(
        (item: { title: string; quantity: number; unit: string }) => ({
          title: item.title,
          quantity: item.quantity,
          unit: item.unit
        })
      )
    ).toEqual([
      { title: 'Picanha', quantity: 1.5, unit: 'KG' },
      { title: 'Cachaça', quantity: 2, unit: 'BOTTLE' },
      { title: 'Carvão', quantity: 2, unit: 'UNIT' }
    ])
  })

  it('should not be able to apply a proposal with an unknown unit', async () => {
    const { token } = await createAndAuthUser({ app })

    const response = await request(app.server)
      .post(`${API_URL_V1_BASE}/ai/apply`)
      .set('Authorization', `Bearer ${token}`)
      .send({ addItems: [{ title: 'Cachaça', quantity: 1, unit: 'BARRIL' }] })

    expect(response.statusCode).toEqual(400)
  })
})
