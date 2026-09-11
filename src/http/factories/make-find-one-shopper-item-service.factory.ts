import { inMemoryShopperItemRepository } from "@/repositories/shopper-item-in-memory.repository.js";
import { inMemoryShopperListRepository } from "@/repositories/shopper-list-in-memory.repository.js";
import { inMemoryUserRepository } from "@/repositories/user-in-memory.repository.js";
import { FindOneShopperItemService } from "@/services/shopper/find-one-shopper-item.service.js";

export function makeFindOneShopperItemService() {
  return new FindOneShopperItemService(inMemoryUserRepository, inMemoryShopperListRepository, inMemoryShopperItemRepository)
}
