import 'dotenv/config'
import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: env.DATA_BASE_CLIENT,
  connection:
    env.DATA_BASE_CLIENT === 'sqlite'
      ? { filename: env.DATABASE_URL }
      : env.DATABASE_URL,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,
}

export const knex = setupKnex(config)
