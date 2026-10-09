import { Router } from 'express'

import type { Services } from '../services'
import { Page } from '../services/auditService'
import { BaseRouter } from './common/routes'
import { populateUserPermissions } from '../middleware/permissions/populateUserPermissions'
import sanitiseUrl from '../middleware/sanitiseUrl'
import breadcrumbs from '../middleware/history/breadcrumbs'
import { historyMiddleware } from '../middleware/history/historyMiddleware'
import populateValidationErrors from '../middleware/validation/populateValidationErrors'
import { FLASH_KEY__SUCCESS_BANNER } from '../utils/constants'
import insertJourneyIdentifier from '../middleware/journey/insertJourneyIdentifier'
import { JourneyRoutes } from './journeys/routes'

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

  get('*any', (req, res, next) => {
    res.locals['originalUrl'] = req.originalUrl // for use by prisoner profile backlink
    res.locals['query'] = req.query // for use by getQueryEntries nunjucks filter
    const successBanner = req.flash(FLASH_KEY__SUCCESS_BANNER)
    res.locals['successBanner'] = successBanner?.[0] ? successBanner[0] : undefined
    next()
  })

  get('/', Page.HOMEPAGE, async (_req, res) => {
    res.render('view', {
      showBreadcrumbs: true,
    })
  })

  router.use(insertJourneyIdentifier())
  router.use('/:journeyId', JourneyRoutes(services))

  return router
}
