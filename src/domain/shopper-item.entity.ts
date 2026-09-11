export interface ShopperItem {
  id: string
  shopperListId: string
  title: string
  description: string
  quantity: number
  purchasedAt: Date | null
  createdAt: Date
}

export interface ShopperItemInput {
  shopperListId: string
  title: string
  description: string
  quantity: number
}
