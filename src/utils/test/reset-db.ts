import { prisma } from '@/config/prisma.js'

export async function resetDb() {
  await prisma.shopperListMember.deleteMany()
  await prisma.shopperItem.deleteMany()
  await prisma.shopperList.deleteMany()
  await prisma.code.deleteMany()
  await prisma.user.deleteMany()
}
