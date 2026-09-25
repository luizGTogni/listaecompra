import 'dotenv/config'
import z from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  LOG_LEVEL: z
    .enum(['warn', 'error', 'fatal', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  MAIL_FROM: z.string().default('Lista&Compra <onboarding@resend.dev>'),
  // NVIDIA NIM keys, tried in order: the second one is the fallback when the
  // first is rate limited or fails. Both optional: without any, the AI
  // routes answer 503.
  NVIDIA_NIM_API_KEY_1: z.string().optional(),
  NVIDIA_NIM_API_KEY_2: z.string().optional(),
  NVIDIA_NIM_MODEL: z.string().default('meta/llama-3.3-70b-instruct'),
  NVIDIA_NIM_API_URL: z
    .string()
    .default('https://integrate.api.nvidia.com/v1/chat/completions'),
  DATABASE_URL: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_DB: z.string(),
  DATABASE_PORT: z.coerce.number().default(5432),
  FRONTEND_URL: z
    .string()
    .default('http://localhost:3001')
    .transform((value) => value.replace(/\/+$/, ''))
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Invalid environment variables', z.treeifyError(_env.error))

  throw new Error('Invalid environment variables.')
}

export const env = _env.data

export const API_URL_V1_BASE = '/api/v1'
