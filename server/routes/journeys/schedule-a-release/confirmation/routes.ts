import { ScheduleReleaseConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const ScheduleReleaseConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new ScheduleReleaseConfirmationController()

  get('/', controller.GET)

  return router
}
