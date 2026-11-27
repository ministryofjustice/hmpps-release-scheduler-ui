import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'
import { BaseRouter } from './common/routes'
import { populateUserPermissions } from '../middleware/permissions/populateUserPermissions'
import sanitiseUrl from '../middleware/sanitiseUrl'
import breadcrumbs from '../middleware/history/breadcrumbs'
import { historyMiddleware } from '../middleware/history/historyMiddleware'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import { JourneyRoutes } from './journeys/routes'
import { HomepageSearchReleasesController } from './controller'
import { validateOnGET } from '../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { ManageReleaseRoutes } from './releases/routes'
import { successBannerMiddleware } from '../middleware/notifications/successBanner'

export default function routes(services: Services): Router {
  const { router, get } = BaseRouter()

  router.use(sanitiseUrl)
  router.use(populateUserPermissions)
  router.use(breadcrumbs())
  router.use(
    historyMiddleware(() => [
      {
        matcher: /^\/$/,
        text: 'Releases',
        alias: Page.HOMEPAGE,
      },
    ]),
  )
  router.use(populateValidationErrors())
  router.use(successBannerMiddleware)

  get('*any', (req, res, next) => {
    res.locals['originalUrl'] = req.originalUrl // for use by prisoner profile backlink
    res.locals['query'] = req.query // for use by getQueryEntries nunjucks filter
    next()
  })

  get(
    '/',
    Page.HOMEPAGE,
    validateOnGET(schema, '*'),
    new HomepageSearchReleasesController(services.releaseSchedulerService).GET,
  )

  router.use('/releases', ManageReleaseRoutes(services))

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
