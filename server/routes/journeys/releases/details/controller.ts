import { NextFunction, Request, Response } from 'express'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from '../../schedule-a-release/details/schema'
import { components } from '../../../../@types/releaseSchedulerApi'
import { joinItems, sentenceCase } from '../../../../utils/formatUtils'

export class UpdateReleaseDetailsController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, release } = req.journeyData.updateRelease!

    res.render('releases/details/view', {
      backUrl,
      release,
      confirmedReleaseDate:
        res.locals.formResponses?.['confirmedReleaseDate'] ?? formatInputDate(release.confirmedReleaseDate!),
      reason: res.locals.formResponses?.['reason'] ?? release.reason?.code,
      comments: res.locals.formResponses?.['comments'] ?? release.comments,
      reasonOptions: await this.releaseSchedulerService.getReferenceData({ res }, 'release-reason'),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.updateRelease!
      const { confirmedReleaseDate, reason, comments } = req.body

      const request: components['schemas']['UnverifyRelease'] = {
        type: 'UnverifyRelease',
        confirmedReleaseDate,
        reasonCode: reason.code,
        comments,
      }

      const response = await this.releaseSchedulerService.putRelease({ res }, journey.release.id, {
        actions: [request],
      })
      journey.result = response.release!
      journey.auditHistory = response.auditHistory
      journey.updateType = 'details'

      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { backUrl, auditHistory, release } = req.journeyData.updateRelease!

    if (auditHistory?.length) {
      const propertiesChanged = auditHistory[0]!.changes.map(
        ({ propertyName }) =>
          ({
            confirmedReleaseDate: 'confirmed release date',
            reason: 'release reason',
            comments: 'comments',
          })[propertyName] ?? propertyName,
      )

      req.flashSuccessBanner({
        heading: `${sentenceCase(joinItems(propertiesChanged))} changed `,
        text: release.status.code === 'VERIFIED' ? 'This release will need to be verified again.' : '',
      })
    }

    res.redirect(backUrl)
  }
}
