export interface ShopperItem {
  id: string
  shopperListId: string
  title: string
  description: string
  quantity: number
  purchasedById: string | null
  purchasedAt: Date | null
  createdAt: Date
}

export interface ShopperItemInput {
  shopperListId: string
  title: string
  description: string
  quantity: number
}
