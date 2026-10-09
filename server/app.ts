import express, { Request } from 'express'

import createError from 'http-errors'

import * as Sentry from '@sentry/node'
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'
import config from './config'

import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import authorisationMiddleware from './middleware/authorisationMiddleware'

import setUpAuthentication from './middleware/setUpAuthentication'
import setUpCsrf from './middleware/setUpCsrf'
import setUpCurrentUser from './middleware/setUpCurrentUser'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebRequestParsing from './middleware/setUpRequestParsing'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpWebSession from './middleware/setUpWebSession'

import routes from './routes'
import type { Services } from './services'

import sentryMiddleware from './middleware/sentryMiddleware'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(sentryMiddleware())
  app.use(setUpHealthChecks(services.applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app)
  app.use(setUpAuthentication())
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())

  app.use(
    telemetryMiddleware.addUserMetadataToTelemetry({
      getAttributes: (req: Request) => ({ username: req.user?.username }),
    }),
  )

  app.use(routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, _res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'e2e-test'))

  return app
}
