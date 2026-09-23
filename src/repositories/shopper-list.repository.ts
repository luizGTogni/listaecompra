import { ShopperItem } from '@/domain/shopper-item.entity.js'
import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'

export interface FilterParams {
  page: number
  limit: number
  query: string
  status?: 'open' | 'closed'
}

export type ShopperListWithUser = ShopperList & {
  user: {
    name: string
    username: string
  }
}

interface FindAllResponse {
  shopperLists: ShopperListWithUser[]
  page: number
  perPage: number
  total: number
}

export type ShopperListWithItemsUser = ShopperListWithUser & {
  shopperItems: ShopperItem[]
}

export interface ShopperListRepository {
  create(data: ShopperListInput): Promise<ShopperList>
  update(shopperList: ShopperList): Promise<ShopperList>
  delete(id: string): Promise<void>
  deleteAll(): Promise<void>
  findById(id: string): Promise<ShopperList | null>
  findWithItemsAndUserById(id: string): Promise<ShopperListWithItemsUser | null>
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
