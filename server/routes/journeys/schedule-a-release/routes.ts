import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { toPrisonerDetails } from '../../../middleware/permissions/populatePrisonerDetails'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import { ScheduleReleaseDetailsRoutes } from './details/routes'
import { ScheduleReleaseCheckAnswersRoutes } from './check-answers/routes'
import { ScheduleReleaseConfirmationRoutes } from './confirmation/routes'

export const ScheduleReleaseRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  const START_ENTRY_PAGES: string[] = [Page.HOMEPAGE]

  get('/start/:id', services.populateReleaseMiddleware({ withHistory: false }), (req, res) => {
    if (req.middleware?.release) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      const lastLandmark = res.locals.breadcrumbs.last()

      req.journeyData.scheduleRelease = {
        backUrl: lastLandmark && START_ENTRY_PAGES.includes(lastLandmark.alias || '') ? lastLandmark.href : '/',
        release: req.middleware.release,
      }
      res.redirect('../details')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.SCHEDULE_RELEASE,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({}),
  )

  router.use('/details', ScheduleReleaseDetailsRoutes(services))
  router.use('/check-answers', ScheduleReleaseCheckAnswersRoutes(services))
  router.use('/confirmation', ScheduleReleaseConfirmationRoutes())

  return router
}
