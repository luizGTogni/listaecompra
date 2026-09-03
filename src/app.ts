import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import Fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { API_URL_V1_BASE, env } from './config/env.js'
import { logger } from './config/logger.js'
import { appRoutes } from './http/routes/index.js'
import { HttpError } from './http/types/errors/http-error.js'

export const app = Fastify({
  logger: env.NODE_ENV === 'dev' ? true : false
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) {
      cb(null, true)
      return
    }

    const hostname = new URL(origin).hostname

    if (hostname === 'localhost') {
      cb(null, true)
      return
    }

    cb(new Error('Not Allowed'), false)
  }
})

app.register(helmet, {
  contentSecurityPolicy: false
})

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

app.register(swagger, {
  openapi: {
    info: {
      title: 'Lista&Compra',
      description: 'API Documentation',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  transform: jsonSchemaTransform
})

app.register(swaggerUi, {
  routePrefix: `${API_URL_V1_BASE}/docs`
})

app.register(appRoutes, {
  prefix: API_URL_V1_BASE
})

app.setErrorHandler((error: Error | ZodError | HttpError, request, reply) => {
  request.log.error(error)

  if (error instanceof ZodError) {
    return reply.status(400).send({
      name: error.name,
      message: error.message,
      issues: error.issues
    })
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      name: error.name,
      message: error.message
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    logger.error(error, error.message)
  }

  if (error instanceof Error) {
    return reply.status(500).send({
      name: 'InternalServerError',
      message: 'Internal server error.'
    })
  }
})
