import { app } from './app.js'
import { env } from './config/env.js'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT
  })
  .then(() => {
    console.log('Server is running...')
    console.log(`http://localhost:${env.PORT}`)
  })
