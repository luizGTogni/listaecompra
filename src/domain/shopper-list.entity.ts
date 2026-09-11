export interface ShopperList {
  id: string
  userId: string
  title: string
  description: string
  closedAt: Date | null
  createdAt: Date
}

export interface ShopperListInput {
  userId: string
  title: string
  description: string
}
