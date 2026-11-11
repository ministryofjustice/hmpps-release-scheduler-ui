import { RequestHandler } from 'express'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import ReleaseSchedulerService from '../../services/apis/releaseSchedulerService'

export const populateRelease =
  (releaseSchedulerService: ReleaseSchedulerService, prisonerSearchApiService: PrisonerSearchApiService) =>
  ({ withHistory }: { withHistory: boolean } = { withHistory: false }): RequestHandler<{ id: string }> => {
    return async (req, res, next) => {
      const [release, auditHistory] = await Promise.all([
        releaseSchedulerService.getRelease({ res }, req.params.id),
        withHistory ? releaseSchedulerService.getReleaseAuditHistory({ res }, req.params.id) : null,
      ])

      if (!release) {
        return res.notFound()
      }

      req.middleware ??= {}
      req.middleware.release = release
      if (auditHistory) req.middleware.auditHistory = auditHistory
      req.middleware.prisonerData = await prisonerSearchApiService.getPrisonerDetails(
        { res },
        release.person.identifier,
      )
      res.locals.prisonerDetails = req.middleware.prisonerData

      return next()
    }
  }
