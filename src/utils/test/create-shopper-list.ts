import { API_URL_V1_BASE } from '@/config/env.js'
import { ShopperList } from '@/domain/shopper-list.entity.js'
import { inMemoryShopperListRepository } from '@/repositories/shopper-list-in-memory.repository.js'
import { FastifyInstance } from 'fastify'
import request from 'supertest'

interface CreateShopperListParams {
  app: FastifyInstance
  token: string
  isClosed?: boolean
  shopperList?: {
    title: string
    description: string
  }
}

interface CreateShopperListResponse {
  shopperList: ShopperList
}

export async function createShopperList({
  app,
  isClosed = false,
  token,
  shopperList = {
    title: 'ShopperList',
    description: 'ShopperList Description'
  }
}: CreateShopperListParams): Promise<CreateShopperListResponse> {
  const response = await request(app.server)
    .post(`${API_URL_V1_BASE}/shoppers`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: shopperList.title,
      description: shopperList.description
    })

  const shopperListUpdated = await inMemoryShopperListRepository.update({
    ...response.body.shopperList,
    closedAt: isClosed
  })

  return { shopperList: shopperListUpdated }
}
