import { ShopperItem, ShopperItemInput } from '@/domain/shopper-item.entity.js'

export interface ShopperItemRepository {
  create(data: ShopperItemInput): Promise<ShopperItem>
  update(shopperItem: ShopperItem): Promise<ShopperItem>
  delete(id: string): Promise<void>
  deleteAll(): Promise<void>
  findByIdAndShopperListId(
    id: string,
    shopperListId: string
  ): Promise<ShopperItem | null>
  findByTitleAndShopperListId(
    title: string,
    shopperListId: string
  ): Promise<ShopperItem | null>
  findAllByShopperListId(shopperListId: string): Promise<ShopperItem[]>
}
