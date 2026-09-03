export function withAuth<T extends Record<string, unknown>>(schema: T) {
  return {
    ...schema,
    security: [{ bearerAuth: [] }]
  }
}
