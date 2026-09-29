import { ITEM_UNITS } from '@/domain/item-unit.js'
import { z } from 'zod'

export const itemUnitSchema = z.enum(ITEM_UNITS)
