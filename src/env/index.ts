import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATA_BASE_CLIENT: z.enum(['pg', 'sqlite']).default('pg'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
})

export const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Environment variables are not valid', _env.error.format())

  throw new Error('Environment variables are not valid')
}

export const env = _env.data
