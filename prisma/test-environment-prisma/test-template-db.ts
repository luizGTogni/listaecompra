export const TEST_TEMPLATE_DB = 'listaecompra_test_template'

// Each test file overwrites process.env.DATABASE_URL with its own ephemeral
// test database. Admin operations (creating/dropping databases) must always
// go through the original, stable connection instead, so it's captured once
// in globalSetup under a dedicated env var that no per-file setup touches.
const ADMIN_DATABASE_URL_ENV = 'TEST_ADMIN_DATABASE_URL'

export function captureAdminConnectionUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL env variable.')
  }

  process.env[ADMIN_DATABASE_URL_ENV] = process.env.DATABASE_URL
}

export function adminConnectionUrl() {
  const url = process.env[ADMIN_DATABASE_URL_ENV]

  if (!url) {
    throw new Error(
      `${ADMIN_DATABASE_URL_ENV} is not set. Did globalSetup run?`
    )
  }

  return url
}

export function connectionUrlForDatabase(databaseName: string) {
  const url = new URL(adminConnectionUrl())

  url.pathname = `/${databaseName}`
  url.searchParams.delete('schema')
  url.searchParams.delete('options')

  return url.toString()
}
