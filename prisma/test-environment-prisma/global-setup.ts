import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { Client } from 'pg'
import {
  adminConnectionUrl,
  captureAdminConnectionUrl,
  connectionUrlForDatabase,
  TEST_TEMPLATE_DB
} from './test-template-db.js'

async function runMigrations(connectionString: string) {
  const PATH_FOLDER = './prisma/migrations'

  const entries = await readdir(PATH_FOLDER, { withFileTypes: true })

  const client = new Client({ connectionString })
  await client.connect()

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory()) {
      const pathFile = path.join(PATH_FOLDER, entry.name, 'migration.sql')

      const sql = await readFile(pathFile, 'utf-8')

      await client.query(sql)
    }
  }

  await client.end()
}

export default async function setup() {
  captureAdminConnectionUrl()

  const adminClient = new Client({ connectionString: adminConnectionUrl() })
  await adminClient.connect()

  await adminClient.query(
    `DROP DATABASE IF EXISTS "${TEST_TEMPLATE_DB}" WITH (FORCE)`
  )
  await adminClient.query(`CREATE DATABASE "${TEST_TEMPLATE_DB}"`)

  await adminClient.end()

  await runMigrations(connectionUrlForDatabase(TEST_TEMPLATE_DB))

  console.log(`[global-setup] template database "${TEST_TEMPLATE_DB}" ready`)
}

