import { ScheduleReleasesCheckAnswersController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'

export const ScheduleReleaseCheckAnswersRoutes = ({ releaseSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleReleasesCheckAnswersController(releaseSchedulerService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
