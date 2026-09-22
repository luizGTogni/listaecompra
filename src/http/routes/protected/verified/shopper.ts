import { acceptShopperListInviteController } from '@/http/controllers/shopper-members/accept-shopper-list-invite.controller.js'
import { createShopperListInviteController } from '@/http/controllers/shopper-members/create-shopper-list-invite.controller.js'
import { declineShopperListInviteController } from '@/http/controllers/shopper-members/decline-shopper-list-invite.controller.js'
import { findAllShopperListMemberController } from '@/http/controllers/shopper-members/find-all-shopper-list-member.controller.js'
import { removeShopperListMemberController } from '@/http/controllers/shopper-members/remove-shopper-list-member.controller.js'
import { addItemShopperListController } from '@/http/controllers/shoppers/add-item-shopper-list.controller.js'
import { createShopperListController } from '@/http/controllers/shoppers/create-shopper-list.controller.js'
import { deleteShopperListController } from '@/http/controllers/shoppers/delete-shopper-list.controller.js'
import { findAllShopperListController } from '@/http/controllers/shoppers/find-all-shopper-list.controller.js'
import { findOneShopperItemController } from '@/http/controllers/shoppers/find-one-shopper-item.controller.js'
import { findOneShopperListController } from '@/http/controllers/shoppers/find-one-shopper-list.controller.js'
import { removeItemShopperListController } from '@/http/controllers/shoppers/remove-item-shopper-list.controller.js'
import { toggleClosedShopperListController } from '@/http/controllers/shoppers/toggle-closed-shopper-list.controller.js'
import { togglePurchasedShopperItemController } from '@/http/controllers/shoppers/toggle-purchased-shopper-item.controller.js'
import { updateShopperItemQuantityController } from '@/http/controllers/shoppers/update-shopper-item-quantity.controller.js'
import { withAuth } from '@/http/schemas/auth/with-auth.schema.js'
import {
  acceptShopperListInviteParamsSchema,
  acceptShopperListInviteResponseSchema
} from '@/http/schemas/shopper-members/accept-shopper-list-invite.schema.js'
import {
  createShopperListInviteParamsSchema,
  createShopperListInviteResponseSchema
} from '@/http/schemas/shopper-members/create-shopper-list-invite.schema.js'
import {
  declineShopperListInviteParamsSchema,
  declineShopperListInviteResponseSchema
} from '@/http/schemas/shopper-members/decline-shopper-list-invite.schema.js'
import { findAllShopperListMemberResponseSchema } from '@/http/schemas/shopper-members/find-all-shopper-list-member.schema.js'
import {
  removeShopperListMemberParamsSchema,
  removeShopperListMemberResponseSchema
} from '@/http/schemas/shopper-members/remove-shopper-list-member.schema.js'
import {
  addItemShopperListBodySchema,
  addItemShopperListParamsSchema,
  addItemShopperListResponseSchema
} from '@/http/schemas/shoppers/add-item-shopper-list.schema.js'
import {
  createShopperListBodySchema,
  createShopperListResponseSchema
} from '@/http/schemas/shoppers/create-shopper-list.schema.js'
import {
  deleteShopperListParamsSchema,
  deleteShopperListResponseSchema
} from '@/http/schemas/shoppers/delete-shopper-list.schema.js'
import {
  findAllShopperListQuerySchema,
  findAllShopperListResponseSchema
} from '@/http/schemas/shoppers/find-all-shopper-list.schema.js'
import {
  findOneShopperItemParamsSchema,
  findOneShopperItemResponseSchema
} from '@/http/schemas/shoppers/find-one-shopper-item.schema.js'
import {
  findOneShopperListParamsSchema,
  findOneShopperListResponseSchema
} from '@/http/schemas/shoppers/find-one-shopper-list.schema.js'
import {
  removeItemShopperListParamsSchema,
  removeItemShopperListResponseSchema
} from '@/http/schemas/shoppers/remove-item-shopper-list.schema.js'
import {
  toggleClosedShopperListParamsSchema,
  toggleClosedShopperListResponseSchema
} from '@/http/schemas/shoppers/toggle-closed-shopper-list.schema.js'
import {
  togglePurchasedShopperItemParamsSchema,
  togglePurchasedShopperItemResponseSchema
} from '@/http/schemas/shoppers/toggle-purchased-shopper-item.schema.js'
import {
  updateShopperItemQuantityBodySchema,
  updateShopperItemQuantityParamsSchema,
  updateShopperItemQuantityResponseSchema
} from '@/http/schemas/shoppers/update-shopper-item-quantity.schema.js'
import { FastifyInstance } from 'fastify'

export async function verifiedShopperRoutes(app: FastifyInstance) {
  app.post(
    '/shoppers',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Create shopper list',
        description: 'Create a new shopper list.',
        body: createShopperListBodySchema,
        response: createShopperListResponseSchema
      })
    },
    createShopperListController
  )

  app.get(
    '/shoppers',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Find all shopper list',
        description: 'Find all shopper list.',
        query: findAllShopperListQuerySchema,
        response: findAllShopperListResponseSchema
      })
    },
    findAllShopperListController
  )

  app.get(
    '/shoppers/:shopperListId',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Find One shopper list',
        description: 'Find one shopper list by id.',
        params: findOneShopperListParamsSchema,
        response: findOneShopperListResponseSchema
      })
    },
    findOneShopperListController
  )

  app.get(
    '/shoppers/:shopperListId/items/:shopperItemId',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Find One shopper item',
        description: 'Find one shopper item by id.',
        params: findOneShopperItemParamsSchema,
        response: findOneShopperItemResponseSchema
      })
    },
    findOneShopperItemController
  )

  app.delete(
    '/shoppers/:shopperListId',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Delete shopper list',
        description: 'Delete a shopper list.',
        params: deleteShopperListParamsSchema,
        response: deleteShopperListResponseSchema
      })
    },
    deleteShopperListController
  )

  app.patch(
    '/shoppers/:shopperListId/items/:shopperItemId/quantity',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Toggle purchased shopper item',
        description: 'Toggle purchased in shopper item.',
        params: updateShopperItemQuantityParamsSchema,
        body: updateShopperItemQuantityBodySchema,
        response: updateShopperItemQuantityResponseSchema
      })
    },
    updateShopperItemQuantityController
  )

  app.patch(
    '/shoppers/:shopperListId/close',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Toggle closed shopper list',
        description: 'Toggle closed in shopper list.',
        params: toggleClosedShopperListParamsSchema,
        response: toggleClosedShopperListResponseSchema
      })
    },
    toggleClosedShopperListController
  )

  app.patch(
    '/shoppers/:shopperListId/items/:shopperItemId/purchase',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Toggle purchased shopper item',
        description: 'Toggle purchased in shopper item.',
        params: togglePurchasedShopperItemParamsSchema,
        response: togglePurchasedShopperItemResponseSchema
      })
    },
    togglePurchasedShopperItemController
  )

  app.post(
    '/shoppers/:shopperListId/items/add',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Add item in shopper list',
        description: 'Add a new item in shopper list.',
        params: addItemShopperListParamsSchema,
        body: addItemShopperListBodySchema,
        response: addItemShopperListResponseSchema
      })
    },
    addItemShopperListController
  )

  app.delete(
    '/shoppers/:shopperListId/items/:shopperItemId/remove',
    {
      schema: withAuth({
        tags: ['Shopper'],
        summary: 'Remove item in shopper list',
        description: 'Remove a item in shopper list.',
        params: removeItemShopperListParamsSchema,
        response: removeItemShopperListResponseSchema
      })
    },
    removeItemShopperListController
  )

  app.post(
    '/shoppers/:shopperListId/members/:memberId/invite',
    {
      schema: withAuth({
        tags: ['Shopper', 'Member'],
        summary: 'Create shopper list invite',
        description: 'Create shopper list invite.',
        params: createShopperListInviteParamsSchema,
        response: createShopperListInviteResponseSchema
      })
    },
    createShopperListInviteController
  )

  app.patch(
    '/shoppers/:shopperListId/members/:memberId/accept',
    {
      schema: withAuth({
        tags: ['Shopper', 'Member'],
        summary: 'Accept shopper list invite',
        description: 'Accept shopper list invite.',
        params: acceptShopperListInviteParamsSchema,
        response: acceptShopperListInviteResponseSchema
      })
    },
    acceptShopperListInviteController
  )

  app.delete(
    '/shoppers/:shopperListId/members/:memberId/decline',
    {
      schema: withAuth({
        tags: ['Shopper', 'Member'],
        summary: 'Decline shopper list invite',
        description: 'Decline shopper list invite.',
        params: declineShopperListInviteParamsSchema,
        response: declineShopperListInviteResponseSchema
      })
    },
    declineShopperListInviteController
  )

  app.get(
    '/shoppers/:shopperListId/members',
    {
      schema: withAuth({
        tags: ['Shopper', 'Member'],
        summary: 'Find all shopper list members',
        description: 'Find all shopper list members.',
        response: findAllShopperListMemberResponseSchema
      })
    },
    findAllShopperListMemberController
  )

  app.delete(
    '/shoppers/:shopperListId/members/:memberId/remove',
    {
      schema: withAuth({
        tags: ['Shopper', 'Member'],
        summary: 'Remove shopper list member',
        description: 'Remove shopper list member.',
        params: removeShopperListMemberParamsSchema,
        response: removeShopperListMemberResponseSchema
      })
    },
    removeShopperListMemberController
  )
}
