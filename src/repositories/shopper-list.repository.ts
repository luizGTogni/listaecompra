import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'

export interface FilterParams {
  page: number
  limit: number
  query: string
  status?: 'open' | 'closed'
}

interface FindAllResponse {
  shopperLists: ShopperList[]
  page: number
  perPage: number
  total: number
}

export interface ShopperListRepository {
  create(data: ShopperListInput): Promise<ShopperList>
  update(shopperList: ShopperList): Promise<ShopperList>
  delete(id: string): Promise<void>
  deleteAll(): Promise<void>
  findById(id: string): Promise<ShopperList | null>
  findByIdAndUserId(id: string, userId: string): Promise<ShopperList | null>
  findByTitleAndUserId(
    title: string,
    userId: string
  ): Promise<ShopperList | null>
  findAllByUserId(
    userId: string,
    filters: FilterParams
  ): Promise<FindAllResponse>
}
