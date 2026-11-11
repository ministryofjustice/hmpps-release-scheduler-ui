import { Request, Response } from 'express'
import ReleaseSchedulerService from '../../../../services/apis/releaseSchedulerService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'

export class ScheduleReleaseDetailsController {
  constructor(private readonly releaseSchedulerService: ReleaseSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, release, confirmedReleaseDate, reason, comments } = req.journeyData.scheduleRelease!

    res.render('schedule-a-release/details/view', {
      backUrl,
      release,
      confirmedReleaseDate: res.locals.formResponses?.['confirmedReleaseDate'] ?? formatInputDate(confirmedReleaseDate),
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      comments: res.locals.formResponses?.['comments'] ?? comments,
      reasonOptions: await this.releaseSchedulerService.getReferenceData({ res }, 'release-reason'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.scheduleRelease!
    journey.confirmedReleaseDate = req.body.confirmedReleaseDate
    journey.reason = req.body.reason
    journey.comments = req.body.comments

    res.redirect('check-answers')
  }
}
