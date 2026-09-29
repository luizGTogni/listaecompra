// Prisma returns Decimal for the quantity; the domain works with plain numbers.
export function withNumberQuantity<
  T extends { quantity: { toNumber(): number } }
>(item: T) {
  return { ...item, quantity: item.quantity.toNumber() }
}
