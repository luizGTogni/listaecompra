export type ShopperListEvent =
  | { type: 'item-added'; actorId: string; itemId: string }
  | { type: 'item-removed'; actorId: string; itemId: string }
  | { type: 'item-purchased-toggled'; actorId: string; itemId: string }
  | { type: 'item-quantity-updated'; actorId: string; itemId: string }
  | { type: 'list-closed-toggled'; actorId: string }
  | { type: 'list-deleted'; actorId: string }
  | { type: 'member-removed'; actorId: string; memberId: string }

export type EventListener = (event: ShopperListEvent) => void

export interface EventPublisherDriver {
  publish(channel: string, event: ShopperListEvent): void
  subscribe(channel: string, listener: EventListener): () => void
}
