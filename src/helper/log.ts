import * as fp from 'fastify-plugin'
import { DateTime } from 'luxon'

const symbolNow = Symbol('RequestTimer')

export type AppLoggerOptions = {
  log?: (...args: any[]) => void
  excludePaths?: string[]
}

export const appFastifyLogger = fp(
  (fastify, opts: AppLoggerOptions, done) => {
    const log = opts.log || console.log

    fastify.addHook('onRequest', (req, _, next) => {
      req.raw[symbolNow] = Date.now()
      next()
    })

    fastify.addHook('onResponse', (req, reply, next) => {
      const elapsed = Date.now() - req.raw[symbolNow]
      const ipAddr = req.headers['x-forwarded-for'] || req.ip

      const cyan = '\x1b[36m'
      const red = '\x1b[31m'
      const yellow = '\x1b[33m'
      const reset = '\x1b[0m'

      let header = cyan + '[INFO] ' + reset
      if (reply.statusCode >= 500) {
        header = red + '[ERROR]' + reset
      } else if (reply.statusCode >= 400) {
        header = yellow + '[WARN] ' + reset
      }

      log(
        `${header} ${DateTime.now().toFormat('dd/MM/yyyy, HH:mm:ss')} - ${ipAddr} - "${req.method} ${req.url}" ${reply.statusCode} - ${elapsed}ms`
      )

      next()
    })

    done()
  },
  {
    fastify: '4.x',
    name: 'app-fastify-logger',
  }
)
