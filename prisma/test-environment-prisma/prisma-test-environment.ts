import { randomUUID } from 'node:crypto'
import { Client } from 'pg'
import type { Environment } from 'vitest/environments'
import {
  adminConnectionUrl,
  connectionUrlForDatabase,
  TEST_TEMPLATE_DB
} from './test-template-db.js'

export default <Environment>{
  name: 'prisma',
  viteEnvironment: 'ssr',
  async setup() {
    const databaseName = `test_${randomUUID().replace(/-/g, '')}`

    const adminClient = new Client({ connectionString: adminConnectionUrl() })
    await adminClient.connect()

    await adminClient.query(
      `CREATE DATABASE "${databaseName}" TEMPLATE "${TEST_TEMPLATE_DB}"`
    )

    await adminClient.end()

    process.env.DATABASE_URL = connectionUrlForDatabase(databaseName)

    return {
      async teardown() {
        const adminClient = new Client({
          connectionString: adminConnectionUrl()
        })
        await adminClient.connect()

        await adminClient.query(
          `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`
        )

        await adminClient.end()
      }
    }
  }
}
