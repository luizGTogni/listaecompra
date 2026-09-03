import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  LOG_LEVEL: z
    .enum(['warn', 'error', 'fatal', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string()
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables', z.treeifyError(_env.error))

  throw new Error('Invalid environment variables.')
}

export const env = _env.data

export const API_URL_V1_BASE = '/api/v1'
