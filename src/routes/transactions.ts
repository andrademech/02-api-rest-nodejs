import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { creckSessionIdExists } from '../middleware/check-session-id-exists'

// Request Body é o que o usuário envia para o servidor
// Reply Body é o que o servidor envia para o usuário

// Cookies <-> formas de manter o contexto entre as requisições

// Testes
// Testes unitários: unidades da sua aplicação
// Testes de integração: testar a integração entre as unidades da sua aplicação
// Testes e2e - ponta a ponta: testar a aplicação como um todo.
// Simula o usuário operando a aplocação

// front-end: abrea a página de login, digita o text email@email.com.br no campo ID
// e clica no botão de login

// back-end: recebe a requisição, valida o email, busca o usuário no banco de dados
// e retorna uma resposta para o front-end

// Pirâmide de testes: E2E (não dependem de nenhuma tecnologia, não dependem de arquitetura)

export async function transactionRoutes(app: FastifyInstance) {
  // Listando as transações
  app.get(
    '/',
    {
      preHandler: [creckSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
    },
  )

  // Listando uma transação única
  app.get(
    '/:id',
    {
      preHandler: [creckSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { transaction }
    },
  )

  // Resumo da conta
  app.get(
    '/summary',
    {
      preHandler: [creckSessionIdExists],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return { summary }
    },
  )

  // Criando uma transação
  app.post('/', async (request, reply) => {
    // { title, amount, type: credit | debit }
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    // incluindo cookies
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    const transactions = await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send({
      message: 'Transaction created successfully',
      transactions,
    })
  })
}
