const security: Record<string, string[]>[] = [
  { cookieAuth: [] },
  { bearerAuth: [] }
]

export function withAuth<T extends Record<string, unknown>>(schema: T) {
  return {
    ...schema,
    security
  }
}
