import { ShopperList, ShopperListInput } from '@/domain/shopper-list.entity.js'

export interface FilterParams {
  page: number
  query: string
}

export interface ShopperListRepository {
  create(data: ShopperListInput): Promise<ShopperList>
  update(shopperList: ShopperList): Promise<ShopperList>
  delete(id: string): Promise<void>
  deleteAll(): Promise<void>
  findByIdAndUserId(id: string, userId: string): Promise<ShopperList | null>
  findByTitleAndUserId(
    title: string,
    userId: string
  ): Promise<ShopperList | null>
  findAllByUserId(userId: string, filters: FilterParams): Promise<ShopperList[]>
}
