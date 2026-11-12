import { Request, Response } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { toPrisonerDetails } from '../../../middleware/permissions/populatePrisonerDetails'
import { UpdateReleaseDetailsRoutes } from './details/routes'
import { UpdateReleaseConfirmationRoutes } from './confirmation/routes'
import { VerifyReleaseRoutes } from './verify/routes'
import { UnscheduleReleaseRoutes } from './unschedule/routes'

export const UpdateReleaseRoutes = (services: Services) => {
  const { router, get } = BaseRouter()
  const { populateReleaseMiddleware } = services

  get(
    '/start-edit/:id/:property',
    populateReleaseMiddleware({ withHistory: false }),
    async (req: Request<{ id: string; property: string }>, res: Response) => {
      let redirectUrl = 'details'

      switch (req.params.property) {
        case 'verify':
          if (req.middleware!.release!.status.code !== 'UNVERIFIED') {
            res.conflict()
            return
          }
          redirectUrl = req.params.property
          break
        case 'unschedule':
          if (!['UNVERIFIED', 'VERIFIED'].includes(req.middleware!.release!.status.code)) {
            res.conflict()
            return
          }
          redirectUrl = req.params.property
          break
        default:
          if (!['UNVERIFIED', 'VERIFIED'].includes(req.middleware!.release!.status.code)) {
            res.conflict()
            return
          }
          redirectUrl += `#${req.params.property}`
          break
      }

      req.journeyData.updateRelease = {
        release: req.middleware!.release!,
        backUrl: `/releases/${req.params.id}`,
        historyQuery: encodeURIComponent(String(req.query['history'])),
      }
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware!.prisonerData!)

      res.redirect(`../../${redirectUrl}`)
    },
  )

  router.use('/details', UpdateReleaseDetailsRoutes(services))
  router.use('/unschedule', UnscheduleReleaseRoutes(services))
  router.use('/verify', VerifyReleaseRoutes(services))
  router.use('/confirmation', UpdateReleaseConfirmationRoutes())

  return router
}
