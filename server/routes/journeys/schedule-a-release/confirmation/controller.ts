import { Request, Response } from 'express'

export class ScheduleReleaseConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { release, confirmedReleaseDate, reason, comments } = req.journeyData.scheduleRelease!

    res.render('schedule-a-release/confirmation/view', {
      release,
      confirmedReleaseDate,
      reason,
      comments,
    })
  }
}
