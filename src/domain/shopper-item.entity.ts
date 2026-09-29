import { ItemUnit } from './item-unit.js'

export interface ShopperItem {
  id: string
  shopperListId: string
  title: string
  description: string
  quantity: number
  unit: ItemUnit
  purchasedById: string | null
  purchasedAt: Date | null
  createdAt: Date
}

export interface ShopperItemInput {
  shopperListId: string
  title: string
  description: string
  quantity: number
  unit?: ItemUnit
}
