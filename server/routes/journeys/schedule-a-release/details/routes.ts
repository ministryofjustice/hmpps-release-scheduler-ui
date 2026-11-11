import { Services } from '../../../../services'
import { ScheduleReleaseDetailsController } from './controller'
import { BaseRouter } from '../../../common/routes'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const ScheduleReleaseDetailsRoutes = ({ releaseSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleReleaseDetailsController(releaseSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(releaseSchedulerService)), controller.POST)

  return router
}
