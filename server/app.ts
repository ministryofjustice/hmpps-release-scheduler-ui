import express, { Request, Response, NextFunction } from 'express'

import * as Sentry from '@sentry/node'
import { telemetryMiddleware } from '@ministryofjustice/hmpps-azure-telemetry'
import { getFrontendComponents, retrieveCaseLoadData } from '@ministryofjustice/hmpps-connect-dps-components'
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
import { auditPageViewMiddleware } from './middleware/audit/auditPageViewMiddleware'
import { auditApiCallMiddleware } from './middleware/audit/auditApiCallMiddleware'
import logger from '../logger'
import PrisonerImageController from './routes/prisonerImageController'
import { handleApiError } from './middleware/validation/handleApiError'

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

  app.get('*any', auditPageViewMiddleware(services.auditService))
  app.post('*any', auditApiCallMiddleware(services.auditService))

  app.get(
    '/auth-error',
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    (_req, res) => {
      res.status(401)
      return res.render('autherror')
    },
  )

  // TODO: add user roles to authorisationMiddleware after roles are created
  app.use(authorisationMiddleware())
  app.use(setUpCsrf())
  app.use(setUpCurrentUser())

  app.get(
    /(.*)/,
    getFrontendComponents({
      logger,
      requestOptions: { includeSharedData: true },
      componentApiConfig: config.apis.componentApi,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
  )

  app.use((_req, res, next) => {
    res.notFound = () => res.status(404).render('pages/not-found')
    res.notAuthorised = () => res.status(403).render('pages/not-authorised')
    res.conflict = () => res.status(409).render('pages/conflict')
    next()
  })

  app.use(
    retrieveCaseLoadData({
      logger,
      prisonApiConfig: config.apis.prisonApi,
    }),
  )

  app.get('/prisoner-image/:prisonNumber', new PrisonerImageController(services.prisonApiService).GET)

  app.use(
    telemetryMiddleware.addUserMetadataToTelemetry({
      getAttributes: (req: Request) => ({ username: req.user?.username }),
    }),
  )
  // TODO: enable serviceEnabledMiddleware after service is added to micro frontend component
  // app.get(/(.*)/, serviceEnabledMiddleware)

  app.use(routes(services))

  if (config.sentry.dsn) Sentry.setupExpressErrorHandler(app)

  app.use((_req, res) => res.notFound())
  // Error handlers must go after `Sentry.setupExpressErrorHandler(app)` for errors to be captured by Sentry
  app.use((error: { message?: string }, _req: Request, res: Response, next: NextFunction) => {
    if (error?.message === 'NOT_AUTHORISED') {
      res.notAuthorised()
    } else {
      next(error)
    }
  })
  app.use(handleApiError)
  app.use(errorHandler(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'e2e-test'))

  return app
}
